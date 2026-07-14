-- All roles except Department Approver belong to Legal Affairs by default.
-- Department Approvers retain a selectable department because they represent the
-- business department responsible for reviewing department-specific content.

create or replace function public.set_staff_profile_department()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role_id <> 'department_approver' then
    new.department_id = 'legal_affairs';
  end if;

  return new;
end;
$$;

-- Normalize existing records as part of the production policy change.
update public.profiles
set department_id = 'legal_affairs'
where role_id <> 'department_approver';
