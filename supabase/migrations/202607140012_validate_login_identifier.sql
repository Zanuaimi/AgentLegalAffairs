-- Defense in depth for username-based login. The RPC uses a bound SQL parameter
-- already, so it is not vulnerable to classic SQL injection; this check also
-- rejects malformed/oversized identifiers before profile lookup.

create or replace function public.resolve_login_email(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where p_username ~ '^[A-Za-z0-9._-]{3,32}$'
    and lower(p.username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
