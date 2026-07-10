# Supabase Backend Setup

This folder contains the backend pieces for the Legal Affairs platform that do **not** require building a manual backend server.

## PostgreSQL database

Schema migration:

```text
supabase/migrations/202607090001_create_legal_affairs_schema.sql
```

Seed data:

```text
supabase/seed.sql
```

The schema converts the previous frontend mock data into PostgreSQL tables:

- `profiles`
- `roles`
- `departments`
- `legal_categories`
- `legal_requests`
- `request_documents`
- `legal_review_criteria`
- `request_checklist_items`
- `document_ai_suggestions`
- `reviewer_comments`
- `department_approvals`
- `manager_actions`
- `audit_logs`

Checklist items are now stored as rows connected to each request/document.

## Demo logins

After applying `seed.sql`, these demo accounts are available:

| Username | Email | Password | Role | Department |
|---|---|---|---|---|
| `requester` | `requester@demo.test` | `password123` | Requester | HR |
| `reviewer` | `reviewer@demo.test` | `password123` | Legal Reviewer | Legal Affairs |
| `manager` | `manager@demo.test` | `password123` | Legal Manager | Legal Affairs |
| `approver` | `approver@demo.test` | `password123` | Department Approver | HR |
| `admin` | `admin@demo.test` | `password123` | Admin User | IT |

The React login page accepts either the email or the short username.

## Local Supabase reset

If you use the Supabase CLI locally:

```sh
supabase db reset
```

This applies migrations and seed data.

## Edge Function

Current function:

```text
supabase/functions/legal-review/index.ts
```

It receives a document from the React app, sends it to Google Gemini, and returns structured AI legal review JSON:

- request category
- extracted clauses
- missing/unusual clauses
- template comparison
- risk highlights
- obligations summary
- draft review note
- suggested requester questions
- related precedents

AI output is always draft support only and must be reviewed by Legal Affairs.

## Required Supabase secrets

For real Gemini mode:

```sh
supabase secrets set GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

For mock/demo backend mode:

```sh
supabase secrets set USE_MOCK_AI_REVIEW="true"
```

If `GEMINI_API_KEY` is missing, the function automatically returns a mock result.

## Deploy

From the repository root:

```sh
supabase functions deploy legal-review
```

## Frontend environment

In `Code/.env.local`:

```env
VITE_USE_MOCK_AI_REVIEW=false
VITE_SUPABASE_FUNCTIONS_URL=https://YOUR_PROJECT_REF.functions.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

For local frontend demos without Supabase:

```env
VITE_USE_MOCK_AI_REVIEW=true
```

## Why Edge Functions?

The frontend must not contain the Gemini API key. Edge Functions run on the backend side of Supabase, so secrets stay protected.
