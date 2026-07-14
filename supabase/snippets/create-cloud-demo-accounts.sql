-- ONE-TIME CLOUD TEST ACCOUNT SETUP
--
-- Run this manually in Supabase Dashboard -> SQL Editor only after migrations have
-- been deployed. This file is intentionally NOT a migration: `supabase db push`
-- never runs it, so predictable test accounts are not created automatically.
--
-- This creates no Admin or Owner account. All users are email-confirmed, so no
-- email confirmation message is sent. Delete these accounts after internship demos.
--
-- Important: this script stops before changing anything if one of these emails is
-- already registered. Use the Supabase Dashboard to remove/repair a partial prior
-- setup rather than running this against existing test users.

begin;

do $$
begin
  if exists (
    select 1
    from auth.users
    where email in (
      'requester1@demo.test',
      'requester2@demo.test',
      'requester3@demo.test',
      'reviewer1@demo.test',
      'reviewer2@demo.test',
      'legalmanager1@demo.test',
      'departmentapproverla@demo.test'
    )
  ) then
    raise exception 'One or more Legal Affairs demo account emails already exist. No accounts were changed.';
  end if;
end
$$;

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change_token,
  reauthentication_token
) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'requester1@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"requester1"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reviewer1@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"reviewer1"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'legalmanager1@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"legalmanager1"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'departmentapproverla@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"departmentapproverla"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'requester2@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"requester2"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'requester3@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"requester3"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reviewer2@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"reviewer2"}', '', '', '', '', '', '', '');

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values
  ('20000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '{"sub":"00000000-0000-0000-0000-000000000101","email":"requester1@demo.test"}', 'email', 'requester1@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', '{"sub":"00000000-0000-0000-0000-000000000102","email":"reviewer1@demo.test"}', 'email', 'reviewer1@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103', '{"sub":"00000000-0000-0000-0000-000000000103","email":"legalmanager1@demo.test"}', 'email', 'legalmanager1@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000104', '{"sub":"00000000-0000-0000-0000-000000000104","email":"departmentapproverla@demo.test"}', 'email', 'departmentapproverla@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000105', '{"sub":"00000000-0000-0000-0000-000000000105","email":"requester2@demo.test"}', 'email', 'requester2@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000106', '{"sub":"00000000-0000-0000-0000-000000000106","email":"requester3@demo.test"}', 'email', 'requester3@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000107', '{"sub":"00000000-0000-0000-0000-000000000107","email":"reviewer2@demo.test"}', 'email', 'reviewer2@demo.test', now(), now(), now());

insert into public.profiles (id, username, full_name, email, prefix, role_id, department_id, status) values
  ('00000000-0000-0000-0000-000000000101', 'requester1', 'Requester 1', 'requester1@demo.test', 'None', 'requester', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000102', 'reviewer1', 'Reviewer 1', 'reviewer1@demo.test', 'None', 'legal_reviewer', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000103', 'legalmanager1', 'Legal Manager 1', 'legalmanager1@demo.test', 'None', 'legal_manager', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000104', 'departmentapproverla', 'Department Approver LA', 'departmentapproverla@demo.test', 'None', 'department_approver', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000105', 'requester2', 'Requester 2', 'requester2@demo.test', 'None', 'requester', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000106', 'requester3', 'Requester 3', 'requester3@demo.test', 'None', 'requester', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000107', 'reviewer2', 'Reviewer 2', 'reviewer2@demo.test', 'None', 'legal_reviewer', 'legal_affairs', 'Active');

commit;

-- Demo credentials (delete these accounts after testing):
--   requester1 / password123      requester2 / password123
--   requester3 / password123      reviewer1 / password123
--   reviewer2 / password123       legalmanager1 / password123
--   departmentapproverla / password123
