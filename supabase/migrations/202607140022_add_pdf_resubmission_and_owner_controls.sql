-- Requester PDF resubmission, previous-result comparison, and Owner-only maintenance actions.

alter table public.request_documents
  add column if not exists is_current boolean not null default true;

alter table public.legal_requests
  add column if not exists previous_document_id uuid references public.request_documents(id),
  add column if not exists previous_ai_summary text,
  add column if not exists previous_ai_review_result jsonb;

create or replace function public.resubmit_request_pdf(
  p_request_id text,
  p_new_document_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.legal_requests
    where id = p_request_id
      and requester_id = auth.uid()
      and status = 'Waiting for More Information'
  ) then
    raise exception 'Only the requester can resubmit a PDF after more information has been requested.';
  end if;

  if not exists (
    select 1 from public.request_documents
    where id = p_new_document_id and request_id = p_request_id
  ) then
    raise exception 'The new PDF does not belong to this request.';
  end if;

  update public.legal_requests request
  set previous_document_id = (
        select id from public.request_documents
        where request_id = p_request_id and is_current and id <> p_new_document_id
        order by created_at desc limit 1
      ),
      previous_ai_summary = request.ai_summary,
      previous_ai_review_result = request.ai_review_result,
      ai_summary = null,
      ai_review_result = null,
      status = 'AI Review Pending'
  where request.id = p_request_id;

  update public.request_documents
  set is_current = (id = p_new_document_id)
  where request_id = p_request_id;

  insert into public.ai_review_jobs (
    request_id, document_id, status, queue_order, current_step, operational_trace
  ) values (
    p_request_id, p_new_document_id, 'queued', extract(epoch from now()) * 1000,
    'Queued for AI review after requester PDF resubmission',
    jsonb_build_array(jsonb_build_object(
      'at', now(),
      'step', 'queued',
      'message', 'Requester uploaded a new PDF. AI review is waiting in the priority queue.'
    ))
  ) on conflict (request_id, document_id) do update set
    status = 'queued', last_error = null, locked_at = null, started_at = null,
    completed_at = null, current_step = excluded.current_step,
    operational_trace = excluded.operational_trace;
end;
$$;

create or replace function public.owner_reset_ai_results()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role_id = 'owner') then
    raise exception 'Only the Owner can reset AI review results.';
  end if;

  delete from public.document_ai_suggestions;
  delete from public.request_checklist_items;
  delete from public.ai_review_jobs;

  update public.legal_requests
  set ai_summary = null,
      ai_review_result = null,
      previous_ai_summary = null,
      previous_ai_review_result = null,
      status = case
        when status not in ('Closed', 'Archived', 'Approved') and exists (
          select 1 from public.request_documents d
          where d.request_id = legal_requests.id and d.storage_path is not null
        ) then 'AI Review Pending'
        else status
      end;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace function public.owner_delete_closed_requests()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare v_count integer;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role_id = 'owner') then
    raise exception 'Only the Owner can delete closed requests.';
  end if;
  delete from public.legal_requests where status = 'Closed';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

create or replace view public.legal_requests_dashboard
with (security_invoker = true) as
select lr.id, lr.title, lr.description, lc.code as category_code, lc.name as category_name,
  d.name as department, requester.full_name as requester, requester.username as requester_username,
  reviewer.full_name as assigned_reviewer, lr.priority, lr.risk_level, lr.status, lr.deadline,
  lr.submitted_at, lr.ai_summary, lr.ai_review_result, lr.manager_decision, lr.department_decision,
  lr.assigned_manager_id, manager.full_name as assigned_manager,
  lr.assigned_department_approver_id, department_approver.full_name as assigned_department_approver,
  lr.assigned_reviewer_id, lr.previous_document_id, lr.previous_ai_summary,
  lr.previous_ai_review_result
from public.legal_requests lr
join public.legal_categories lc on lc.code = lr.category_code
join public.departments d on d.id = lr.department_id
join public.profiles requester on requester.id = lr.requester_id
left join public.profiles reviewer on reviewer.id = lr.assigned_reviewer_id
left join public.profiles manager on manager.id = lr.assigned_manager_id
left join public.profiles department_approver on department_approver.id = lr.assigned_department_approver_id;

grant execute on function public.resubmit_request_pdf(text, uuid) to authenticated;
grant execute on function public.owner_reset_ai_results() to authenticated;
grant execute on function public.owner_delete_closed_requests() to authenticated;
