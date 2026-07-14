# Production Deployment Guide

This project has two deployments:

1. **Vercel** hosts the React/Vite frontend in `Code/`.
2. **Supabase** hosts Auth, PostgreSQL, private PDF Storage, migrations, and the `legal-review` Edge Function.

## 1. Deploy the frontend on Vercel

Import the GitHub repository and use these settings:

| Vercel setting | Value |
| --- | --- |
| Root Directory | `Code` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Add these Vercel environment variables:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
VITE_SUPABASE_FUNCTIONS_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
VITE_USE_MOCK_AI_REVIEW=false
```

`VITE_` variables are included in browser code. They must never contain server secrets.

## 2. Deploy Supabase database and Edge Function

From the repository root, link the production Supabase project and apply migrations:

```sh
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
supabase functions deploy legal-review
```

### Optional: one-time cloud demo accounts

For a short-lived internship demonstration only, run
`supabase/snippets/create-cloud-demo-accounts.sql` manually in **Supabase Dashboard → SQL Editor** after the migrations are deployed. It creates seven predictable, non-privileged accounts and **never** runs as part of `supabase db push`.

- It creates no Admin or Owner account.
- It stops without changing data if any demo email already exists.
- Delete the accounts after the demonstration.

Set these secrets in the **Supabase** project, not in Vercel:

```sh
supabase secrets set GEMINI_API_KEY=YOUR_GEMINI_KEY
supabase secrets set ALLOWED_ORIGINS=https://YOUR_VERCEL_PROJECT.vercel.app
```

For a custom domain, include it too as a comma-separated list:

```text
https://YOUR_VERCEL_PROJECT.vercel.app,https://legal.example.edu
```

Do not place any of these values in Vercel:

```text
GEMINI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_SECRET_KEY
DATABASE_PASSWORD
```

## 3. Configure Supabase Auth

In **Supabase Dashboard → Authentication → URL Configuration**:

- Set **Site URL** to the production Vercel URL.
- Add the Vercel URL to **Redirect URLs**.
- Add the custom domain too, if one is configured.

## 4. Verify production behavior

Use non-sensitive test PDFs first:

1. Register a new requester account. It must be created as `Requester` only.
2. Submit a PDF request and confirm the request is automatically assigned.
3. Confirm the PDF opens only while signed in and authorized.
4. Confirm the AI review result is a draft and requires human review.
5. Confirm reviewer routing and manager reassignment work.
6. Confirm an unauthorized account cannot open another request or its PDF.

## Security notes

- The `legal-documents` bucket is private. The frontend receives 15-minute signed PDF URLs only after Supabase authorizes the request/document read.
- Database RLS restricts legal request data to the requester, assigned reviewer, relevant department approver, Legal Manager, or Admin User.
- Vercel applies basic security headers through `Code/vercel.json`.
- The Edge Function accepts browser origins configured in the `ALLOWED_ORIGINS` Supabase secret. Update it whenever the production domain changes.
- Before using real university legal documents, obtain approval for document retention, Gemini data handling, access control, incident response, backups, and data residency.
