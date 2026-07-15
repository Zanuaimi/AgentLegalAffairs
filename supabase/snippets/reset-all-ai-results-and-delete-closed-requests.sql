-- DESTRUCTIVE CLOUD CLEANUP
-- Run manually in Supabase Dashboard -> SQL Editor only when you intentionally
-- want to remove AI output from all non-closed requests and delete closed requests.
--
-- Deletes: closed request rows, AI suggestions, AI checklists, AI jobs, and
-- reviewer comments for remaining requests. It preserves requester accounts,
-- open request records, manager actions, department approvals, and audit logs.
-- Only requests with a private Storage PDF are set to AI Review Pending because
-- only those requests can later be rebuilt and processed by Gemini.

begin;

-- Delete closed requests first. Child request/document/checklist/job rows cascade.
delete from public.legal_requests
where status = 'Closed';

-- Remove every remaining AI suggestion, checklist result, queue job, and comment.
delete from public.document_ai_suggestions;
delete from public.request_checklist_items;
delete from public.ai_review_jobs;
delete from public.reviewer_comments;

-- Clear every remaining AI result. Only queueable requests become pending.
update public.legal_requests request
set
  ai_summary = null,
  ai_review_result = null,
  status = case
    when exists (
      select 1 from public.request_documents document
      where document.request_id = request.id
        and document.storage_path is not null
    ) then 'AI Review Pending'
    else request.status
  end;

commit;

-- After running this script, use Legal Affair Engine -> Rebuild Pending AI Queue.
-- Static demo PDFs (public_url only) and requests with failed/missing uploads are
-- intentionally not marked pending because Gemini cannot retrieve those files.
