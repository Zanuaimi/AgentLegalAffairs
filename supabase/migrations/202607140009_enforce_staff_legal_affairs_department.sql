-- Legal Affairs staff always belong to the Legal Affairs department.
-- Department Approvers are the only role whose represented department is chosen
-- in the Admin table, because they approve content for that department.

create or replace function public.set_staff_profile_department()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role_id in ('admin_user', 'legal_manager', 'legal_reviewer') then
    new.department_id = 'legal_affairs';
  end if;

  return new;
end;
$$;

drop trigger if exists set_staff_profile_department on public.profiles;
create trigger a_set_staff_profile_department
before insert or update on public.profiles
for each row execute function public.set_staff_profile_department();
