-- Server-enforced request routing for reviewer assignment and escalation.
-- These functions run atomically and validate the authenticated user's role.

create or replace function public.auto_assign_legal_reviewer(p_request_id text)
returns table(reviewer_id uuid, reviewer_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer_id uuid;
  v_reviewer_name text;
begin
  select p.id, p.full_name
  into v_reviewer_id, v_reviewer_name
  from public.profiles p
  where p.role_id = 'legal_reviewer'
  order by (
    select count(*)
    from public.legal_requests lr
    where lr.assigned_reviewer_id = p.id
      and lr.status not in ('Closed', 'Archived')
  ), p.created_at
  limit 1;

  if v_reviewer_id is null then
    raise exception 'No Legal Reviewer is available for automatic assignment.';
  end if;

  update public.legal_requests
  set assigned_reviewer_id = v_reviewer_id,
      status = 'Assigned to Legal Reviewer'
  where id = p_request_id
    and requester_id = auth.uid();

  if not found then
    raise exception 'Only the requester can automatically assign this new request.';
  end if;

  return query select v_reviewer_id, v_reviewer_name;
end;
$$;

create or replace function public.assign_reviewer_as_manager(
  p_request_id text,
  p_reviewer_id uuid
)
returns table(reviewer_id uuid, reviewer_name text, request_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_manager_department_id text;
  v_reviewer_name text;
begin
  select department_id
  into v_manager_department_id
  from public.profiles
  where id = auth.uid()
    and role_id = 'legal_manager';

  if v_manager_department_id is null then
    raise exception 'Only a Legal Manager can assign a reviewer.';
  end if;

  select full_name
  into v_reviewer_name
  from public.profiles
  where id = p_reviewer_id
    and role_id = 'legal_reviewer'
    and department_id = v_manager_department_id;

  if v_reviewer_name is null then
    raise exception 'Choose a Legal Reviewer from your department.';
  end if;

  update public.legal_requests
  set assigned_reviewer_id = p_reviewer_id,
      status = 'Assigned to Legal Reviewer',
      manager_decision = 'Reviewer assigned by Legal Manager'
  where id = p_request_id;

  if not found then
    raise exception 'Request not found.';
  end if;

  insert into public.manager_actions (request_id, manager_id, action)
  values (p_request_id, auth.uid(), 'Assigned reviewer: ' || v_reviewer_name);

  return query select p_reviewer_id, v_reviewer_name, 'Assigned to Legal Reviewer'::text;
end;
$$;

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
begin
  if p_destination not in ('requester', 'legal_manager') then
    raise exception 'Unsupported routing destination.';
  end if;

  if nullif(trim(p_comment_text), '') is null then
    raise exception 'Provide a message explaining why the request is being routed.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role_id = 'legal_reviewer'
  ) then
    raise exception 'Only a Legal Reviewer can route a request.';
  end if;

  v_status := case p_destination
    when 'requester' then 'Waiting for More Information'
    when 'legal_manager' then 'Sent for Internal Approval'
  end;

  update public.legal_requests
  set status = v_status
  where id = p_request_id
    and assigned_reviewer_id = auth.uid();

  if not found then
    raise exception 'You can only route requests assigned to you.';
  end if;

  insert into public.reviewer_comments (request_id, reviewer_id, comment_text)
  values (p_request_id, auth.uid(), p_comment_text);

  return query select v_status;
end;
$$;

grant execute on function public.auto_assign_legal_reviewer(text) to authenticated;
grant execute on function public.assign_reviewer_as_manager(text, uuid) to authenticated;
grant execute on function public.route_request_as_reviewer(text, text, text) to authenticated;
