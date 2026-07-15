Current implementation after latest work:

Core app: React/Vite `Code/`; Supabase schema/RLS/Storage/Edge Function. Local validation standard: `supabase db reset` for backend migration/function changes; `npm --prefix Code run build` for frontend edits. Never run db reset cloud. Cloud deploy: `supabase db push`, `supabase functions deploy legal-review` after function changes, Vercel deploy frontend.

Recent migrations 014–023:
- 014 active reviewer/manager queue + last_active tracking; 015 dept approver routing/queue; 016 owner controls/queue rebuild; 017 owner routing; 018 queue rebuild feedback; 019 registration availability RPC; 020 cleanup incomplete request after Storage upload failure; 021 owner delete hardened; 022 requester PDF resubmission + current document/previous AI result + Owner reset/delete closed controls; 023 Owner reset uses explicit DELETE WHERE due cloud safe-delete.

Latest workflow/UI:
- Legal Reviewer sidebar now ONLY Dashboard, Requests Assigned to You, Request Details (Global Requests removed). Reviewer queue filters assigned reviewer + excludes closed.
- Requester: My Current + My Closed; no global list.
- Legal Manager/Department Approver have global/assigned queues; Owner no assigned queue.
- Dashboard cards clickable: Total/Pending/Under Review/High Risk filters.
- Closed rows always sort after active/faded; approved green.
- AI queue Edge Function now background-schedules next queued job after successful result. `deno check supabase/functions/legal-review/index.ts` passed.
- Owner tab includes Reset AI Results/Delete Closed, now in-app confirm modal. Generic error surfaced; cloud error `DELETE requires a WHERE clause` fixed by 023 (requires db push).
- Owner delete uses `delete_request_as_owner` hardened 021.
- Requester revision: if status Waiting for More Information, Request Details shows RequestPdfResubmissionPanel. Upload path `${requestId}/revisions/${Date.now()}-${file.name}`, creates doc, RPC archives immediate prior AI summary/result, marks new current, queues AI. Shows New PDF badge and Previous PDF AI Review summary.
- Request form normal upload path `${requestId}/${Date.now()}-${file.name}` to private bucket. Removed `upsert:true` because caused Storage RLS due missing UPDATE policy. Failure calls cleanup RPC then reports exact PDF upload error.
- Storage PDFs: seeded demo requests originally use Vercel public URLs `/demo-pdfs/...`; they do not show in `legal-documents` and cannot queue to Gemini until manually uploaded then update `request_documents.storage_path`. Real uploads should create request-ID folder.
- InfoButton mobile change: tap overlay viewport-safe. Header settings mobile scroll/wrap; Bitwarden data-bwignore on signed-in change password fields. Password is minimum 6 only, no uppercase requirement.
- Removed redundant AI Draft Summary card and completed AI queue tile.
- AI suggestions/backfills SQL snippets:
  * `backfill-cloud-demo-page-suggestions.sql`
  * `backfill-cloud-demo-ai-results.sql` (real PDFs checked: vendor 2pp, HR 3pp, research 3pp)
  * `reset-processable-ai-reviews-for-rebuild.sql`
  * `reset-all-ai-results-and-delete-closed-requests.sql` destructive.
- Cloud demo accounts script + requests script in `supabase/snippets`.

Cloud checklist: private `legal-documents` bucket, 10 MB+ file limit, PDF MIME recommended; Storage RLS policies SELECT/INSERT authenticated created by migration 140004. `ALLOWED_ORIGINS` exact Vercel URL(s), `GEMINI_API_KEY` Supabase secret. Auth URL config. Do not set service key in Vercel.

Requirements PDF audit: Version 1 MVP explicitly listed page 13 is met: intake/category/upload/assignment/status/comments/basic AI/checklist/dashboard/audit/RBAC. Broader future/partial: final response docs, configurable workflows, knowledge base, notifications, advanced reports, restricted LEG-E access, immutable comprehensive audit. Do not overclaim these as MVP failures.

Latest user requested only context compaction after reviewer nav change.