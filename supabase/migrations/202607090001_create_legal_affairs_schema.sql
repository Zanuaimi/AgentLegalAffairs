-- Legal Affairs Request Management Platform schema
-- Backend stack: Supabase + PostgreSQL
--
-- This migration converts the frontend mock data into normalized database tables.
-- Supabase Auth stores passwords/users in auth.users. Our public.profiles table
-- stores role, department, username, and display information for the app.

create extension if not exists pgcrypto;

-- 1) Controlled values as lookup tables.
create table if not exists public.roles (
  id text primary key,
  name text not null unique
);

create table if not exists public.departments (
  id text primary key,
  name text not null unique
);

create table if not exists public.legal_categories (
  code text primary key,
  name text not null
);

create table if not exists public.request_statuses (
  name text primary key,
  sort_order integer not null
);

create table if not exists public.legal_review_criteria (
  id bigserial primary key,
  criteria text not null unique,
  sort_order integer not null unique
);

-- 2) User profile connected to Supabase Auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null,
  email text not null unique,
  prefix text not null default 'None',
  role_id text not null references public.roles(id),
  department_id text not null references public.departments(id),
  status text not null default 'Active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Main legal request workflow tables.
create table if not exists public.legal_requests (
  id text primary key,
  title text not null,
  description text not null default '',
  requester_id uuid not null references public.profiles(id),
  department_id text not null references public.departments(id),
  category_code text not null references public.legal_categories(code),
  assigned_reviewer_id uuid references public.profiles(id),
  priority text not null check (priority in ('Low', 'Medium', 'High', 'Urgent')),
  risk_level text not null default 'Not Classified',
  status text not null references public.request_statuses(name),
  deadline date,
  submitted_at timestamptz not null default now(),
  ai_summary text,
  ai_review_result jsonb,
  manager_decision text,
  department_decision text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.request_documents (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.legal_requests(id) on delete cascade,
  file_name text not null,
  mime_type text not null default 'application/pdf',
  storage_path text,
  public_url text,
  created_at timestamptz not null default now()
);

-- Checklist rows belong to a request/document, not global mock objects.
create table if not exists public.request_checklist_items (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.legal_requests(id) on delete cascade,
  document_id uuid references public.request_documents(id) on delete cascade,
  criteria_id bigint not null references public.legal_review_criteria(id),
  page text not null default 'N/A',
  checked boolean not null default false,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, document_id, criteria_id)
);

create table if not exists public.document_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.request_documents(id) on delete cascade,
  page text not null default 'N/A',
  suggestion_type text not null,
  suggestion_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reviewer_comments (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.legal_requests(id) on delete cascade,
  reviewer_id uuid references public.profiles(id),
  comment_text text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.department_approvals (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.legal_requests(id) on delete cascade,
  approver_id uuid references public.profiles(id),
  decision text not null default 'Pending Department Review',
  comment_text text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.manager_actions (
  id uuid primary key default gen_random_uuid(),
  request_id text not null references public.legal_requests(id) on delete cascade,
  manager_id uuid references public.profiles(id),
  action text not null,
  note text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id bigserial primary key,
  request_id text,
  action text not null,
  actor_id uuid references public.profiles(id),
  actor_name text not null,
  created_at timestamptz not null default now()
);

-- 4) Helpful views for the frontend.
create or replace view public.legal_requests_dashboard
with (security_invoker = true) as
select
  lr.id,
  lr.title,
  lr.description,
  lc.code as category_code,
  lc.name as category_name,
  d.name as department,
  requester.full_name as requester,
  requester.username as requester_username,
  reviewer.full_name as assigned_reviewer,
  lr.priority,
  lr.risk_level,
  lr.status,
  lr.deadline,
  lr.submitted_at,
  lr.ai_summary,
  lr.ai_review_result,
  lr.manager_decision,
  lr.department_decision
from public.legal_requests lr
join public.legal_categories lc on lc.code = lr.category_code
join public.departments d on d.id = lr.department_id
join public.profiles requester on requester.id = lr.requester_id
left join public.profiles reviewer on reviewer.id = lr.assigned_reviewer_id;

-- 5) Basic updated_at trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_legal_requests_updated_at on public.legal_requests;
create trigger set_legal_requests_updated_at
before update on public.legal_requests
for each row execute function public.set_updated_at();

drop trigger if exists set_request_checklist_items_updated_at on public.request_checklist_items;
create trigger set_request_checklist_items_updated_at
before update on public.request_checklist_items
for each row execute function public.set_updated_at();

-- 6) Supabase Storage bucket for PDF legal documents.
insert into storage.buckets (id, name, public)
values ('legal-documents', 'legal-documents', true)
on conflict (id) do update set public = excluded.public;

create policy "authenticated users upload legal documents"
on storage.objects for insert to authenticated
with check (bucket_id = 'legal-documents');

create policy "authenticated users read legal documents"
on storage.objects for select to authenticated
using (bucket_id = 'legal-documents');

-- 7) API grants for Supabase client roles.
-- RLS policies below still decide which rows each authenticated user may access.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select, update on all sequences in schema public to authenticated;

-- 8) Row Level Security.
alter table public.roles enable row level security;
alter table public.departments enable row level security;
alter table public.legal_categories enable row level security;
alter table public.request_statuses enable row level security;
alter table public.legal_review_criteria enable row level security;
alter table public.profiles enable row level security;
alter table public.legal_requests enable row level security;
alter table public.request_documents enable row level security;
alter table public.request_checklist_items enable row level security;
alter table public.document_ai_suggestions enable row level security;
alter table public.reviewer_comments enable row level security;
alter table public.department_approvals enable row level security;
alter table public.manager_actions enable row level security;
alter table public.audit_logs enable row level security;

-- BEGINNER NOTE:
-- These RLS policies are intentionally simple for the university demo V1.
-- A production backend should tighten write policies further and test every role.

create policy "read lookup tables" on public.roles for select to authenticated using (true);
create policy "read departments" on public.departments for select to authenticated using (true);
create policy "read legal categories" on public.legal_categories for select to authenticated using (true);
create policy "read statuses" on public.request_statuses for select to authenticated using (true);
create policy "read criteria" on public.legal_review_criteria for select to authenticated using (true);

create policy "read profiles" on public.profiles for select to authenticated using (true);
create policy "users create own profile" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "users update own profile basic" on public.profiles for update to authenticated using (id = auth.uid());
create policy "admins update profiles" on public.profiles for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);

create policy "read legal requests for demo roles" on public.legal_requests for select to authenticated using (true);
create policy "requesters create legal requests" on public.legal_requests for insert to authenticated with check (requester_id = auth.uid());
create policy "legal staff update legal requests" on public.legal_requests for update to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
    and p.role_id in ('legal_reviewer', 'legal_manager', 'department_approver', 'admin_user')
  )
);

create policy "read request documents" on public.request_documents for select to authenticated using (true);
create policy "create request documents" on public.request_documents for insert to authenticated with check (true);

create policy "read checklist" on public.request_checklist_items for select to authenticated using (true);
create policy "legal reviewers update checklist" on public.request_checklist_items for update to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'legal_reviewer')
);
create policy "create checklist rows" on public.request_checklist_items for insert to authenticated with check (true);

create policy "read ai suggestions" on public.document_ai_suggestions for select to authenticated using (true);
create policy "create ai suggestions" on public.document_ai_suggestions for insert to authenticated with check (true);

create policy "read reviewer comments" on public.reviewer_comments for select to authenticated using (true);
create policy "authenticated users create request comments" on public.reviewer_comments for insert to authenticated with check (reviewer_id = auth.uid());

create policy "read department approvals" on public.department_approvals for select to authenticated using (true);
create policy "department approvers manage approvals" on public.department_approvals for all to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'department_approver')
) with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'department_approver')
);

create policy "read manager actions" on public.manager_actions for select to authenticated using (true);
create policy "legal managers create actions" on public.manager_actions for insert to authenticated with check (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'legal_manager')
);

create policy "admins read audit logs" on public.audit_logs for select to authenticated using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id = 'admin_user')
);
create policy "authenticated create audit logs" on public.audit_logs for insert to authenticated with check (true);
