-- The legal-review Edge Function uses the service_role database key to claim
-- queue jobs and persist AI-review results. Local PostgreSQL still requires
-- explicit table and sequence privileges for that role.
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select, update on all sequences in schema public to service_role;
