-- Usernames are login identifiers. Keep them simple and predictable:
-- letters, numbers, and underscores only; no spaces, dots, or hyphens.
-- NOT VALID preserves existing legacy usernames while enforcing the rule for
-- every new profile and any future username update.
alter table public.profiles
  add constraint profiles_username_simple_format
  check (username ~ '^[A-Za-z0-9_]{3,32}$') not valid;

create or replace function public.resolve_login_email(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where p_username ~ '^[A-Za-z0-9_]{3,32}$'
    and lower(p.username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
