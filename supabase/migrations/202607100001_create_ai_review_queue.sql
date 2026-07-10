-- Persistent AI review queue for Legal Affairs requests.
-- Requests are submitted first, then Gemini review runs asynchronously from this queue.

insert into public.request_statuses (name, sort_order) values
  ('AI Review Pending', 11),
  ('AI Review Processing', 12),
  ('AI Review Complete', 13),
  ('AI Review Failed', 14)
on conflict (name) do update set sort_order = excluded.sort_order;

create table if not exists public.ai_review_jobs (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.legal_requests(id) on delete cascade,
  document_id uuid not null references public.request_documents(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  attempt_count integer not null default 0,
  last_error text,
  locked_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, document_id)
);

create index if not exists ai_review_jobs_status_created_at_idx
on public.ai_review_jobs (status, created_at);

create index if not exists ai_review_jobs_processing_started_at_idx
on public.ai_review_jobs (status, started_at);

drop trigger if exists set_ai_review_jobs_updated_at on public.ai_review_jobs;
create trigger set_ai_review_jobs_updated_at
before update on public.ai_review_jobs
for each row execute function public.set_updated_at();

alter table public.ai_review_jobs enable row level security;

grant select, insert, update on public.ai_review_jobs to authenticated;

create policy "read ai review jobs" on public.ai_review_jobs
for select to authenticated using (true);

create policy "create ai review jobs" on public.ai_review_jobs
for insert to authenticated with check (true);

-- Backend-only atomic queue claim. SECURITY DEFINER lets the Edge Function claim exactly
-- one oldest queued/stale job while avoiding two workers processing the same request.
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
  return query
  with next_job as (
    select job.id
    from public.ai_review_jobs job
    where job.status = 'queued'
       or (
         job.status = 'processing'
         and job.started_at < now() - make_interval(mins => stale_after_minutes)
       )
    order by job.created_at asc
    for update skip locked
    limit 1
  ), claimed as (
    update public.ai_review_jobs job
    set
      status = 'processing',
      attempt_count = job.attempt_count + 1,
      last_error = null,
      locked_at = now(),
      started_at = now()
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
