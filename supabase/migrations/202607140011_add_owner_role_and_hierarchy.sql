-- Owner is the highest application role. It is deliberately not assignable from
-- the normal Admin UI: create/recover Owner accounts through the Supabase
-- Dashboard SQL Editor so an ordinary role-management mistake cannot remove the
-- final platform owner.

insert into public.roles (id, name)
values ('owner', 'Owner')
on conflict (id) do update set name = excluded.name;

-- Owners are part of Legal Affairs, like other platform staff.
update public.profiles
set department_id = 'legal_affairs'
where role_id = 'owner';

-- Owner can manage Admin Users and lower roles. Admin Users can manage only
-- non-Admin, non-Owner profiles. Neither role can change its own role.
create or replace function public.prevent_unauthorized_profile_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text;
begin
  if auth.uid() is not null and new.role_id is distinct from old.role_id then
    if old.id = auth.uid() then
      raise exception 'You cannot change your own role.';
    end if;

    select role_id into v_actor_role
    from public.profiles
    where id = auth.uid();

    if v_actor_role = 'owner' then
      if old.role_id = 'owner' or new.role_id = 'owner' then
        raise exception 'Owner accounts are managed outside the normal role-management workflow.';
      end if;
    elsif v_actor_role = 'admin_user' then
      if old.role_id in ('owner', 'admin_user')
        or new.role_id in ('owner', 'admin_user') then
        raise exception 'Only an Owner can manage Admin User roles.';
      end if;
    else
      raise exception 'Only an Owner or Admin User can change a profile role.';
    end if;
  end if;

  if auth.uid() is not null and new.department_id is distinct from old.department_id then
    select role_id into v_actor_role
    from public.profiles
    where id = auth.uid();

    if v_actor_role not in ('owner', 'admin_user') then
      raise exception 'Only an Owner or Admin User can change a profile department.';
    end if;
  end if;

  return new;
end;
$$;

-- Replace the broad Admin profile-update policy with hierarchy-aware policies.
drop policy if exists "admins update profiles" on public.profiles;
drop policy if exists "owners update non-owner profiles" on public.profiles;
drop policy if exists "admins update non-privileged profiles" on public.profiles;

create policy "owners update non-owner profiles" on public.profiles
for update to authenticated
using (
  role_id <> 'owner'
  and exists (
    select 1 from public.profiles actor
    where actor.id = auth.uid() and actor.role_id = 'owner'
  )
)
with check (role_id <> 'owner');

create policy "admins update non-privileged profiles" on public.profiles
for update to authenticated
using (
  role_id not in ('owner', 'admin_user')
  and exists (
    select 1 from public.profiles actor
    where actor.id = auth.uid() and actor.role_id = 'admin_user'
  )
)
with check (role_id not in ('owner', 'admin_user'));

-- Owners have the same operational visibility/control as Admin Users.
drop policy if exists "admins read ai engine control" on public.ai_engine_control;
create policy "admins and owners read ai engine control" on public.ai_engine_control
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
);

drop policy if exists "admins update ai engine control" on public.ai_engine_control;
create policy "admins and owners update ai engine control" on public.ai_engine_control
for update to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
);

drop policy if exists "admins update ai review jobs" on public.ai_review_jobs;
create policy "admins and owners update ai review jobs" on public.ai_review_jobs
for update to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
) with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
);

drop policy if exists "admins read ai engine events" on public.ai_engine_events;
create policy "admins and owners read ai engine events" on public.ai_engine_events
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
);

drop policy if exists "admins create ai engine events" on public.ai_engine_events;
create policy "admins and owners create ai engine events" on public.ai_engine_events
for insert to authenticated with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
);

drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "admins and owners read audit logs" on public.audit_logs
for select to authenticated using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role_id in ('admin_user', 'owner')
  )
);

-- Owners can see and manage all legal request records through the same protected
-- helper functions that already serve Legal Managers and Admin Users.
create or replace function public.can_access_legal_request(p_request_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.legal_requests lr
    where lr.id = p_request_id
      and (
        lr.requester_id = auth.uid()
        or lr.assigned_reviewer_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id in ('legal_manager', 'admin_user', 'owner')
        )
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id = 'department_approver'
            and p.department_id = lr.department_id
        )
      )
  );
$$;

create or replace function public.can_update_legal_request(p_request_id text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.legal_requests lr
    where lr.id = p_request_id
      and (
        lr.assigned_reviewer_id = auth.uid()
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id in ('legal_manager', 'admin_user', 'owner')
        )
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid()
            and p.role_id = 'department_approver'
            and p.department_id = lr.department_id
        )
      )
  );
$$;
