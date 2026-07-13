## Required validation workflow

- Whenever modifying code under `Code/`, run `npm run build` with working directory `Code/` (the child directory of the AgentLegalAffairs repository).
- Whenever modifying anything related to the Supabase backend (for example: `supabase/migrations`, Edge Functions, database schema, RLS policies, storage policies, seeds, or backend configuration), run `supabase db reset` as part of validation. This resets the local Supabase database and is destructive to local data; do not run it against a remote/hosted production project.