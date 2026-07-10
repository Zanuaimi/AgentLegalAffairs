# Project scope update: fullstack development

The Legal Affairs Request Management Platform is no longer frontend-only.

Current scope includes both:

- React/Vite/Tailwind frontend in `Code/`
- Supabase + PostgreSQL backend in `supabase/`

Backend work is allowed and expected, including:

- Supabase Auth login/registration/session handling
- PostgreSQL schema migrations
- PostgreSQL seed data
- Row Level Security policies
- Supabase Storage for PDF documents
- Supabase Edge Functions
- Gemini AI legal review integration through backend/Edge Function only
- database-backed request, checklist, comments, users, audit logs, manager actions, and department approvals

Important security rule:

- Do not put Gemini API keys, Supabase service role keys, DB passwords, or other secrets in frontend code, committed files, or chat prompts.
- Gemini API key belongs in Supabase secrets or local non-committed Edge Function env files.
- Frontend can use Supabase anon/publishable key only.

Old frontend-only/BACKEND TODO assumptions are outdated. Future implementation should prefer real Supabase/PostgreSQL integration, with mock fallback only as a development convenience if explicitly useful.