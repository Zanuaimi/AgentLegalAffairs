-- Even an Admin User must not be able to remove or alter their own role.
-- A second administrator, or the Supabase Dashboard SQL Editor for emergency
-- recovery, must perform that sensitive role change instead.

create or replace function public.prevent_unauthorized_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and new.role_id is distinct from old.role_id then
    if old.id = auth.uid() then
      raise exception 'You cannot change your own role.';
    end if;

    if not exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role_id = 'admin_user'
    ) then
      raise exception 'Only an Admin User can change a profile role.';
    end if;
  end if;

  if auth.uid() is not null and new.department_id is distinct from old.department_id then
    if not exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role_id = 'admin_user'
    ) then
      raise exception 'Only an Admin User can change a profile department.';
    end if;
  end if;

  return new;
end;
$$;
