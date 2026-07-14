-- Backfill page-specific AI suggestions for existing cloud demo requests.
--
-- Run manually in Supabase Dashboard -> SQL Editor.
-- This does NOT create users, requests, PDFs, queue jobs, or AI results.
-- It replaces suggestions only for LA-2026-001 through LA-2026-003.

begin;

delete from public.document_ai_suggestions
where document_id in (
  select id
  from public.request_documents
  where request_id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003')
);

insert into public.document_ai_suggestions (
  document_id,
  page,
  suggestion_type,
  suggestion_text
)
select
  document.id,
  suggestion.page,
  suggestion.suggestion_type,
  suggestion.suggestion_text
from public.request_documents document
join (
  values
    (
      'LA-2026-001',
      '1',
      'Risk',
      'AI draft: Review payment terms, liability limits, termination rights, confidentiality, and signature authority before approval.'
    ),
    (
      'LA-2026-002',
      '1',
      'Clarification',
      'AI draft: Ask for the current approved policy and confirm which departments and employees the update will affect.'
    ),
    (
      'LA-2026-003',
      '1',
      'Missing Clause',
      'AI draft: Confirm data protection, publication rights, intellectual-property ownership, confidentiality, and governing-law clauses.'
    )
) as suggestion(request_id, page, suggestion_type, suggestion_text)
  on suggestion.request_id = document.request_id
where document.request_id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003');

commit;

-- Optional verification after running:
-- select document.request_id, suggestion.page, suggestion.suggestion_type, suggestion.suggestion_text
-- from public.document_ai_suggestions suggestion
-- join public.request_documents document on document.id = suggestion.document_id
-- where document.request_id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003')
-- order by document.request_id, suggestion.page;
