-- Admin controls and safe operational tracing for the Legal Affair Engine.
-- This stores observable processing steps, not model hidden chain-of-thought.

alter table public.ai_review_jobs
  add column if not exists queue_order bigint,
  add column if not exists current_step text not null default 'Queued for AI review',
  add column if not exists operational_trace jsonb not null default '[]'::jsonb;

update public.ai_review_jobs
set queue_order = floor(extract(epoch from created_at) * 1000)::bigint
where queue_order is null;

alter table public.ai_review_jobs
  alter column queue_order set not null;

create index if not exists ai_review_jobs_status_queue_order_idx
on public.ai_review_jobs (status, queue_order, created_at);

create table if not exists public.ai_engine_control (
  id text primary key default 'legal_affair_engine',
  is_running boolean not null default true,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now(),
  constraint ai_engine_control_singleton check (id = 'legal_affair_engine')
);

insert into public.ai_engine_control (id, is_running)
values ('legal_affair_engine', true)
on conflict (id) do nothing;

drop trigger if exists set_ai_engine_control_updated_at on public.ai_engine_control;
create trigger set_ai_engine_control_updated_at
before update on public.ai_engine_control
for each row execute function public.set_updated_at();

alter table public.ai_engine_control enable row level security;

grant select, update on public.ai_engine_control to authenticated;

drop policy if exists "admins read ai engine control" on public.ai_engine_control;
create policy "admins read ai engine control" on public.ai_engine_control
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);

drop policy if exists "admins update ai engine control" on public.ai_engine_control;
create policy "admins update ai engine control" on public.ai_engine_control
for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);

-- Allow admins to reorder queued jobs from the admin Legal Affair Engine page.
drop policy if exists "admins update ai review jobs" on public.ai_review_jobs;
create policy "admins update ai review jobs" on public.ai_review_jobs
for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);

create or replace function public.claim_next_ai_review_job(stale_after_minutes integer default 15)
returns table (
  job_id uuid,
  request_id text,
  document_id uuid,
  storage_path text,
  file_name text,
  mime_type text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.ai_engine_control control
    where control.id = 'legal_affair_engine'
    and control.is_running = true
  ) then
    return;
  end if;

  return query
  with next_job as (
    select job.id
    from public.ai_review_jobs job
    join public.legal_requests request on request.id = job.request_id
    where job.status = 'queued'
       or (
         job.status = 'processing'
         and job.started_at < now() - make_interval(mins => stale_after_minutes)
       )
    order by
      case request.priority
        when 'Urgent' then 1
        when 'High' then 2
        when 'Medium' then 3
        when 'Low' then 4
        else 5
      end asc,
      job.queue_order asc,
      job.created_at asc
    for update skip locked
    limit 1
  ), claimed as (
    update public.ai_review_jobs job
    set
      status = 'processing',
      attempt_count = job.attempt_count + 1,
      last_error = null,
      locked_at = now(),
      started_at = now(),
      current_step = 'Claimed by Legal Affair Engine',
      operational_trace = job.operational_trace || jsonb_build_array(
        jsonb_build_object(
          'at', now(),
          'step', 'claimed',
          'message', 'Job claimed from priority queue for processing.'
        )
      )
    from next_job
    where job.id = next_job.id
    returning job.id, job.request_id, job.document_id
  )
  select
    claimed.id as job_id,
    claimed.request_id,
    claimed.document_id,
    document.storage_path,
    document.file_name,
    document.mime_type
  from claimed
  join public.request_documents document on document.id = claimed.document_id;
end;
$$;

revoke all on function public.claim_next_ai_review_job(integer) from public;
grant execute on function public.claim_next_ai_review_job(integer) to service_role;
