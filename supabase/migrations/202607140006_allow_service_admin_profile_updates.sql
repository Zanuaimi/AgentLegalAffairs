-- Supabase Dashboard SQL Editor runs without an end-user JWT, so it must be able
-- to bootstrap the first Admin User. Browser users remain restricted: only an
-- existing Admin User may change role or department through the application.

create or replace function public.prevent_unauthorized_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
    and (
      new.role_id is distinct from old.role_id
      or new.department_id is distinct from old.department_id
    ) then
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
