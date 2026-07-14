-- Production access controls for confidential legal requests and PDF documents.
-- A user may access a request only when they are its requester, assigned reviewer,
-- department approver for the request's department, Legal Manager, or Admin User.

create or replace function public.can_access_legal_request(p_request_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.legal_requests lr
    where lr.id = p_request_id
      and (
        lr.requester_id = auth.uid()
        or lr.assigned_reviewer_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id in ('legal_manager', 'admin_user')
        )
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id = 'department_approver'
            and p.department_id = lr.department_id
        )
      )
  );
$$;

create or replace function public.can_update_legal_request(p_request_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.legal_requests lr
    where lr.id = p_request_id
      and (
        lr.assigned_reviewer_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id in ('legal_manager', 'admin_user')
        )
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id = 'department_approver'
            and p.department_id = lr.department_id
        )
      )
  );
$$;

revoke all on function public.can_access_legal_request(text) from public;
revoke all on function public.can_update_legal_request(text) from public;
grant execute on function public.can_access_legal_request(text) to authenticated;
grant execute on function public.can_update_legal_request(text) to authenticated;

-- PDFs must never be publicly addressable in production. The frontend obtains a
-- short-lived signed URL only after the request_documents select policy succeeds.
update storage.buckets
set public = false
where id = 'legal-documents';

drop policy if exists "authenticated users upload legal documents" on storage.objects;
drop policy if exists "authenticated users read legal documents" on storage.objects;

create policy "authorized users upload request PDFs"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'legal-documents'
  and exists (
    select 1
    from public.legal_requests lr
    where lr.id = split_part(name, '/', 1)
      and lr.requester_id = auth.uid()
  )
);

create policy "authorized users read request PDFs"
on storage.objects for select to authenticated
using (
  bucket_id = 'legal-documents'
  and exists (
    select 1
    from public.request_documents rd
    where rd.storage_path = name
      and public.can_access_legal_request(rd.request_id)
  )
);

-- Replace demo-wide reads with access checks tied to the parent legal request.
drop policy if exists "read legal requests for demo roles" on public.legal_requests;
create policy "authorized users read legal requests"
on public.legal_requests for select to authenticated
using (public.can_access_legal_request(id));

drop policy if exists "legal staff update legal requests" on public.legal_requests;
create policy "authorized staff update legal requests"
on public.legal_requests for update to authenticated
using (public.can_update_legal_request(id))
with check (public.can_update_legal_request(id));

drop policy if exists "read request documents" on public.request_documents;
drop policy if exists "create request documents" on public.request_documents;
create policy "authorized users read request documents"
on public.request_documents for select to authenticated
using (public.can_access_legal_request(request_id));
create policy "requesters create their request documents"
on public.request_documents for insert to authenticated
with check (
  exists (
    select 1 from public.legal_requests lr
    where lr.id = request_id and lr.requester_id = auth.uid()
  )
);

drop policy if exists "read checklist" on public.request_checklist_items;
drop policy if exists "legal reviewers update checklist" on public.request_checklist_items;
drop policy if exists "create checklist rows" on public.request_checklist_items;
create policy "authorized users read request checklist"
on public.request_checklist_items for select to authenticated
using (public.can_access_legal_request(request_id));
create policy "assigned reviewer updates checklist"
on public.request_checklist_items for update to authenticated
using (public.can_update_legal_request(request_id))
with check (public.can_update_legal_request(request_id));
create policy "requesters create initial checklist rows"
on public.request_checklist_items for insert to authenticated
with check (
  exists (
    select 1 from public.legal_requests lr
    where lr.id = request_id and lr.requester_id = auth.uid()
  )
);

drop policy if exists "read ai suggestions" on public.document_ai_suggestions;
drop policy if exists "create ai suggestions" on public.document_ai_suggestions;
create policy "authorized users read AI suggestions"
on public.document_ai_suggestions for select to authenticated
using (
  exists (
    select 1 from public.request_documents rd
    where rd.id = document_id
      and public.can_access_legal_request(rd.request_id)
  )
);

drop policy if exists "read reviewer comments" on public.reviewer_comments;
drop policy if exists "authenticated users create request comments" on public.reviewer_comments;
create policy "authorized users read reviewer comments"
on public.reviewer_comments for select to authenticated
using (public.can_access_legal_request(request_id));
create policy "authorized users create request comments"
on public.reviewer_comments for insert to authenticated
with check (
  reviewer_id = auth.uid()
  and public.can_access_legal_request(request_id)
);

drop policy if exists "read department approvals" on public.department_approvals;
create policy "authorized users read department approvals"
on public.department_approvals for select to authenticated
using (public.can_access_legal_request(request_id));

-- Queue metadata is also confidential: only people allowed to see the request
-- may read its AI job state from the browser.
drop policy if exists "read ai review jobs" on public.ai_review_jobs;
create policy "authorized users read AI review jobs"
on public.ai_review_jobs for select to authenticated
using (public.can_access_legal_request(request_id));

drop policy if exists "read manager actions" on public.manager_actions;
create policy "authorized users read manager actions"
on public.manager_actions for select to authenticated
using (public.can_access_legal_request(request_id));
