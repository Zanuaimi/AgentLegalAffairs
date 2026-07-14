-- Allow Legal Reviewers to route a completed review to the matching Department Approver.

alter table public.legal_requests
  add column if not exists assigned_department_approver_id uuid references public.profiles(id);

create index if not exists legal_requests_assigned_department_approver_idx
  on public.legal_requests (assigned_department_approver_id, status);

create or replace function public.route_request_as_reviewer(
  p_request_id text,
  p_destination text,
  p_comment_text text
)
returns table(request_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_manager_id uuid;
  v_department_approver_id uuid;
  v_department_id text;
begin
  if p_destination not in ('requester', 'legal_manager', 'department_approver') then
    raise exception 'Unsupported routing destination.';
  end if;

  if nullif(trim(p_comment_text), '') is null then
    raise exception 'Provide a message explaining why the request is being routed.';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role_id = 'legal_reviewer'
      and status = 'Active'
  ) then
    raise exception 'Only an active Legal Reviewer can route a request.';
  end if;

  select department_id into v_department_id
  from public.legal_requests
  where id = p_request_id
    and assigned_reviewer_id = auth.uid();

  if v_department_id is null then
    raise exception 'You can only route requests assigned to you.';
  end if;

  if p_destination = 'legal_manager' then
    select p.id into v_manager_id
    from public.profiles p
    where p.role_id = 'legal_manager'
      and p.status = 'Active'
    order by p.last_active_at desc, p.created_at
    limit 1;

    if v_manager_id is null then
      raise exception 'No active Legal Manager is available for review.';
    end if;
  end if;

  if p_destination = 'department_approver' then
    select p.id into v_department_approver_id
    from public.profiles p
    where p.role_id = 'department_approver'
      and p.status = 'Active'
      and p.department_id = v_department_id
    order by p.last_active_at desc, p.created_at
    limit 1;

    if v_department_approver_id is null then
      raise exception 'No active Department Approver is available for this request''s department.';
    end if;
  end if;

  v_status := case p_destination
    when 'requester' then 'Waiting for More Information'
    else 'Sent for Internal Approval'
  end;

  update public.legal_requests
  set status = v_status,
      assigned_manager_id = case when p_destination = 'legal_manager' then v_manager_id else null end,
      assigned_department_approver_id = case when p_destination = 'department_approver' then v_department_approver_id else null end,
      department_decision = case when p_destination = 'department_approver' then 'Pending Department Review' else department_decision end
  where id = p_request_id
    and assigned_reviewer_id = auth.uid();

  insert into public.reviewer_comments (request_id, reviewer_id, comment_text)
  values (p_request_id, auth.uid(), p_comment_text);

  return query select v_status;
end;
$$;

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
  lr.department_decision,
  lr.assigned_manager_id,
  manager.full_name as assigned_manager,
  lr.assigned_department_approver_id,
  department_approver.full_name as assigned_department_approver
from public.legal_requests lr
join public.legal_categories lc on lc.code = lr.category_code
join public.departments d on d.id = lr.department_id
join public.profiles requester on requester.id = lr.requester_id
left join public.profiles reviewer on reviewer.id = lr.assigned_reviewer_id
left join public.profiles manager on manager.id = lr.assigned_manager_id
left join public.profiles department_approver on department_approver.id = lr.assigned_department_approver_id;

grant execute on function public.route_request_as_reviewer(text, text, text) to authenticated;
