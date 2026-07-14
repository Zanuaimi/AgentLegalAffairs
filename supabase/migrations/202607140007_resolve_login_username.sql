-- Supabase Auth signs in with email/password. This narrowly scoped function lets
-- the login screen accept the application's unique profile username as well.
-- It returns an email only for an exact username match; the UI still uses the
-- same generic invalid-credentials message for missing users or bad passwords.

create or replace function public.resolve_login_email(p_username text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.email
  from public.profiles p
  where lower(p.username) = lower(trim(p_username))
  limit 1;
$$;

revoke all on function public.resolve_login_email(text) from public;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
