-- Public sign-up may create Requester profiles only.
-- Staff roles and department changes are controlled by an Admin User.

drop policy if exists "users create own profile" on public.profiles;
create policy "users create requester profile" on public.profiles
for insert to authenticated
with check (
  id = auth.uid()
  and role_id = 'requester'
);

create or replace function public.prevent_unauthorized_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role_id is distinct from old.role_id
    or new.department_id is distinct from old.department_id then
    if not exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role_id = 'admin_user'
    ) then
      raise exception 'Only an Admin User can change a profile role or department.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_profile_privilege_change on public.profiles;
create trigger prevent_unauthorized_profile_privilege_change
before update on public.profiles
for each row execute function public.prevent_unauthorized_profile_privilege_change();
