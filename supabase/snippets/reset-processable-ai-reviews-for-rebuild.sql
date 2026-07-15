-- Reset processable AI review artifacts so Admin/Owner can use
-- "Rebuild Pending AI Queue" afterwards.
--
-- Run manually in Supabase Dashboard -> SQL Editor.
--
-- Safety rules:
-- - Includes only non-terminal requests with a private Storage PDF (storage_path).
-- - Excludes Closed, Archived, and Approved requests.
-- - Preserves human reviewer comments, manager actions, department approvals,
--   audit logs, request priority, and existing request-assigned risk level.
-- - Static Vercel demo PDFs (public_url only) cannot be sent to Gemini and are
--   intentionally excluded.

begin;

create temporary table ai_reset_candidates on commit drop as
select distinct request.id, document.id as document_id
from public.legal_requests request
join public.request_documents document
  on document.request_id = request.id
where document.storage_path is not null
  and request.status not in ('Closed', 'Archived', 'Approved');

-- Remove AI-generated per-page suggestions and checklist output.
delete from public.document_ai_suggestions suggestion
using ai_reset_candidates candidate
where suggestion.document_id = candidate.document_id;

delete from public.request_checklist_items checklist
using ai_reset_candidates candidate
where checklist.request_id = candidate.id
  and checklist.document_id = candidate.document_id;

-- Remove completed/failed/queued job records. The Admin/Owner rebuild action
-- recreates them in priority order after this SQL finishes.
delete from public.ai_review_jobs job
using ai_reset_candidates candidate
where job.request_id = candidate.id
  and job.document_id = candidate.document_id;

-- Clear only AI output and return each processable request to the pending state.
update public.legal_requests request
set
  status = 'AI Review Pending',
  ai_summary = null,
  ai_review_result = null
where request.id in (select id from ai_reset_candidates);

commit;

-- Verify the reset before using Rebuild Pending AI Queue:
-- select request.id, request.title, request.status, document.storage_path
-- from public.legal_requests request
-- join public.request_documents document on document.request_id = request.id
-- where request.status = 'AI Review Pending'
-- order by request.priority, request.submitted_at;
