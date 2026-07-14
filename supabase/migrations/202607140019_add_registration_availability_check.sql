-- Registration helper for immediate email and username availability feedback.
-- The final uniqueness guarantees remain auth.users.email and profiles.username/email.

create or replace function public.check_registration_availability(
  p_email text,
  p_username text
)
returns jsonb
language sql
stable
security definer
set search_path = public, auth
as $$
  select jsonb_build_object(
    'emailAvailable', not exists (
      select 1 from auth.users
      where lower(email) = lower(trim(p_email))
    ) and not exists (
      select 1 from public.profiles
      where lower(email) = lower(trim(p_email))
    ),
    'usernameAvailable', not exists (
      select 1 from public.profiles
      where lower(username) = lower(trim(p_username))
    )
  );
$$;

revoke all on function public.check_registration_availability(text, text) from public;
grant execute on function public.check_registration_availability(text, text) to anon, authenticated;
