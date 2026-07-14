-- Owner has the same workflow authority as Legal Reviewer and Legal Manager.

create or replace function public.assign_reviewer_as_manager(p_request_id text, p_reviewer_id uuid)
returns table(reviewer_id uuid, reviewer_name text, request_status text)
language plpgsql security definer set search_path = public as $$
declare v_department_id text; v_reviewer_name text;
begin
  select department_id into v_department_id from public.profiles
  where id = auth.uid() and role_id in ('legal_manager', 'owner');
  if v_department_id is null then raise exception 'Only a Legal Manager or Owner can assign a reviewer.'; end if;
  select full_name into v_reviewer_name from public.profiles
  where id = p_reviewer_id and role_id = 'legal_reviewer' and department_id = v_department_id;
  if v_reviewer_name is null then raise exception 'Choose a Legal Reviewer from your department.'; end if;
  update public.legal_requests set assigned_reviewer_id = p_reviewer_id, status = 'Assigned to Legal Reviewer', manager_decision = 'Reviewer assigned by Legal Manager'
  where id = p_request_id;
  if not found then raise exception 'Request not found.'; end if;
  insert into public.manager_actions (request_id, manager_id, action) values (p_request_id, auth.uid(), 'Assigned reviewer: ' || v_reviewer_name);
  return query select p_reviewer_id, v_reviewer_name, 'Assigned to Legal Reviewer'::text;
end; $$;

create or replace function public.route_request_as_reviewer(p_request_id text, p_destination text, p_comment_text text)
returns table(request_status text)
language plpgsql security definer set search_path = public as $$
declare v_status text; v_manager_id uuid; v_department_approver_id uuid; v_department_id text; v_is_owner boolean;
begin
  if p_destination not in ('requester', 'legal_manager', 'department_approver') then raise exception 'Unsupported routing destination.'; end if;
  if nullif(trim(p_comment_text), '') is null then raise exception 'Provide a message explaining why the request is being routed.'; end if;
  select role_id = 'owner' into v_is_owner from public.profiles where id = auth.uid();
  if not coalesce(v_is_owner, false) and not exists (select 1 from public.profiles where id = auth.uid() and role_id = 'legal_reviewer' and status = 'Active') then raise exception 'Only an active Legal Reviewer or Owner can route a request.'; end if;
  select department_id into v_department_id from public.legal_requests where id = p_request_id and (assigned_reviewer_id = auth.uid() or v_is_owner);
  if v_department_id is null then raise exception 'You can only route requests assigned to you.'; end if;
  if p_destination = 'legal_manager' then
    select id into v_manager_id from public.profiles where role_id = 'legal_manager' and status = 'Active' order by last_active_at desc, created_at limit 1;
    if v_manager_id is null then raise exception 'No active Legal Manager is available for review.'; end if;
  elsif p_destination = 'department_approver' then
    select id into v_department_approver_id from public.profiles where role_id = 'department_approver' and status = 'Active' and department_id = v_department_id order by last_active_at desc, created_at limit 1;
    if v_department_approver_id is null then raise exception 'No active Department Approver is available for this request''s department.'; end if;
  end if;
  v_status := case when p_destination = 'requester' then 'Waiting for More Information' else 'Sent for Internal Approval' end;
  update public.legal_requests set status = v_status,
    assigned_manager_id = case when p_destination = 'legal_manager' then v_manager_id else null end,
    assigned_department_approver_id = case when p_destination = 'department_approver' then v_department_approver_id else null end,
    department_decision = case when p_destination = 'department_approver' then 'Pending Department Review' else department_decision end
  where id = p_request_id and (assigned_reviewer_id = auth.uid() or v_is_owner);
  insert into public.reviewer_comments (request_id, reviewer_id, comment_text) values (p_request_id, auth.uid(), p_comment_text);
  return query select v_status;
end; $$;

grant execute on function public.assign_reviewer_as_manager(text, uuid) to authenticated;
grant execute on function public.route_request_as_reviewer(text, text, text) to authenticated;
