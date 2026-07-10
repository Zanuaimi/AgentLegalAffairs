-- Persistent terminal/event log for Legal Affair Engine operations.
-- This captures observable operations/errors, not hidden model chain-of-thought.

create table if not exists public.ai_engine_events (
  id bigserial primary key,
  event_type text not null,
  level text not null default 'info' check (level in ('info', 'status', 'warning', 'error')),
  message text not null,
  request_id text references public.legal_requests(id) on delete set null,
  job_id uuid references public.ai_review_jobs(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ai_engine_events_created_at_idx
on public.ai_engine_events (created_at desc);

alter table public.ai_engine_events enable row level security;

grant select, insert on public.ai_engine_events to authenticated;
grant usage, select on sequence public.ai_engine_events_id_seq to authenticated;

drop policy if exists "admins read ai engine events" on public.ai_engine_events;
create policy "admins read ai engine events" on public.ai_engine_events
for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);

drop policy if exists "admins create ai engine events" on public.ai_engine_events;
create policy "admins create ai engine events" on public.ai_engine_events
for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);
