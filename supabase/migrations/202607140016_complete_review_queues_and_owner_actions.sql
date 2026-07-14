-- Complete role queues, owner workflow access, and admin AI queue reconstruction.

create or replace function public.can_update_legal_request(p_request_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.legal_requests lr
    where lr.id = p_request_id and (
      lr.assigned_reviewer_id = auth.uid()
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id in ('legal_manager', 'department_approver', 'admin_user', 'owner'))
    )
  );
$$;

drop policy if exists "department approvers manage approvals" on public.department_approvals;
create policy "department approvers and owners manage approvals"
on public.department_approvals for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id in ('department_approver', 'owner')))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id in ('department_approver', 'owner')));

drop policy if exists "legal managers create actions" on public.manager_actions;
create policy "legal managers and owners create actions"
on public.manager_actions for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role_id in ('legal_manager', 'owner')));

create or replace function public.rebuild_ai_review_queue()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role_id in ('admin_user', 'owner')) then
    raise exception 'Only an Admin User or Owner can rebuild the AI review queue.';
  end if;

  with candidates as (
    select lr.id as request_id, d.id as document_id,
      row_number() over (order by case lr.priority when 'Urgent' then 1 when 'High' then 2 when 'Medium' then 3 else 4 end, lr.submitted_at) as queue_position
    from public.legal_requests lr
    join lateral (
      select id, storage_path from public.request_documents
      where request_id = lr.id and storage_path is not null
      order by created_at asc limit 1
    ) d on true
    where lr.ai_review_result is null
      and lr.status not in ('Closed', 'Archived', 'Approved')
  ), queued as (
    insert into public.ai_review_jobs (request_id, document_id, status, queue_order, current_step, operational_trace)
    select request_id, document_id, 'queued', queue_position, 'Queue rebuilt by administrator', jsonb_build_array(jsonb_build_object('at', now(), 'step', 'queued', 'message', 'Queue rebuilt by administrator.'))
    from candidates
    on conflict (request_id, document_id) do update set
      status = 'queued', queue_order = excluded.queue_order, last_error = null,
      locked_at = null, started_at = null, completed_at = null,
      current_step = excluded.current_step, operational_trace = excluded.operational_trace
    returning request_id
  ) select count(*) into v_count from queued;

  return v_count;
end;
$$;

create or replace function public.delete_request_as_owner(p_request_id text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where id = auth.uid() and role_id = 'owner') then
    raise exception 'Only the Owner can delete a request.';
  end if;
  delete from storage.objects
  where bucket_id = 'legal-documents'
    and name in (select storage_path from public.request_documents where request_id = p_request_id and storage_path is not null);
  delete from public.legal_requests where id = p_request_id;
  if not found then raise exception 'Request not found.'; end if;
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
  lr.assigned_reviewer_id
from public.legal_requests lr
join public.legal_categories lc on lc.code = lr.category_code
join public.departments d on d.id = lr.department_id
join public.profiles requester on requester.id = lr.requester_id
left join public.profiles reviewer on reviewer.id = lr.assigned_reviewer_id
left join public.profiles manager on manager.id = lr.assigned_manager_id
left join public.profiles department_approver on department_approver.id = lr.assigned_department_approver_id;

grant execute on function public.rebuild_ai_review_queue() to authenticated;
grant execute on function public.delete_request_as_owner(text) to authenticated;
