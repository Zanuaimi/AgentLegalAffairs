-- Complete AI-result backfill for existing cloud demo requests.
--
-- Run manually in Supabase Dashboard -> SQL Editor.
-- It fills ai_review_result, creates checklist rows, and creates page-specific
-- suggestions for LA-2026-001, LA-2026-002, and LA-2026-003.
-- It does not call Gemini or modify account, reviewer, manager, or department decisions.

begin;

-- A complete stored AI result prevents the Request Details page from showing
-- "Pending AI Review" when a demo request already has an AI draft summary.
update public.legal_requests
set ai_review_result = case id
  when 'LA-2026-001' then jsonb_build_object(
    'request_category', 'Vendor Agreement',
    'category_confidence', 0.88,
    'extracted_clauses', jsonb_build_array(
      jsonb_build_object('clause_title', 'Scope of Services', 'clause_text', 'Vendor services are described in the agreement.', 'location_hint', 'Page 1'),
      jsonb_build_object('clause_title', 'Payment Terms', 'clause_text', 'Payment obligations require Finance confirmation.', 'location_hint', 'Page 1'),
      jsonb_build_object('clause_title', 'Termination', 'clause_text', 'Termination language requires Legal Affairs review.', 'location_hint', 'Page 2')
    ),
    'missing_or_unusual_clauses', jsonb_build_array(
      jsonb_build_object('clause_title', 'Data Protection', 'issue_type', 'missing', 'explanation', 'Confirm appropriate data protection obligations before signature.', 'page', '2'),
      jsonb_build_object('clause_title', 'Liability and Indemnity', 'issue_type', 'unusual', 'explanation', 'Review the liability allocation against the university standard position.', 'page', '2')
    ),
    'template_comparisons', jsonb_build_array(jsonb_build_object('template_name', 'Vendor Services Agreement Template v2.1', 'match_score', 0.68, 'deviations', jsonb_build_array('Confirm data-protection language', 'Review liability wording'))),
    'risk_highlights', jsonb_build_array(
      jsonb_build_object('term', 'Liability', 'risk_level', 'high', 'reason', 'Liability wording needs manual Legal Affairs review.', 'clause_text', 'Liability section identified.', 'page', '2'),
      jsonb_build_object('term', 'Payment Terms', 'risk_level', 'medium', 'reason', 'Confirm payment schedule and approvals.', 'clause_text', 'Payment terms identified.', 'page', '1')
    ),
    'obligations_summary', jsonb_build_array('Confirm vendor scope and deliverables.', 'Confirm Finance review of payment terms.', 'Review termination, confidentiality, and liability provisions.'),
    'draft_review_note', 'DRAFT REVIEW NOTE — Vendor agreement requires human Legal Affairs review of payment, liability, data protection, termination, and signature authority before approval.',
    'suggested_questions', jsonb_build_array('Has Finance reviewed the payment schedule?', 'Will the vendor process university or personal data?', 'Can the vendor accept the university liability position?'),
    'related_precedents', jsonb_build_array(jsonb_build_object('title', 'Vendor Agreement with CloudSoft Inc. (2023)', 'summary', 'SaaS agreement requiring data-security and breach-notification wording.', 'similarity_score', 0.82, 'source_id', 'PRECEDENT-0027')),
    'disclaimer', 'This output is an AI draft and does not constitute final legal advice or approval.',
    'ai_mode', 'seeded_cloud_demo'
  )
  when 'LA-2026-002' then jsonb_build_object(
    'request_category', 'Legal Advice / Opinion',
    'category_confidence', 0.9,
    'extracted_clauses', jsonb_build_array(
      jsonb_build_object('clause_title', 'Policy Update Context', 'clause_text', 'The request asks Legal Affairs to clarify an employment-policy update affecting overtime approval.', 'location_hint', 'Page 1'),
            jsonb_build_object('clause_title', 'Approval Authority', 'clause_text', 'Approval authority needs clearer wording and inconsistent departmental application is a stated risk.', 'location_hint', 'Page 2'),
            jsonb_build_object('clause_title', 'Final Legal Approval', 'clause_text', 'Final approval must remain with the Legal Affairs reviewer and the final opinion should be archived.', 'location_hint', 'Page 3')
    ),
    'missing_or_unusual_clauses', jsonb_build_array(jsonb_build_object('clause_title', 'Current Approved Policy Version', 'issue_type', 'missing', 'explanation', 'Page 2 states that the current approved policy version is missing; final advice should wait for it.', 'page', '2')),
    'template_comparisons', jsonb_build_array(jsonb_build_object('template_name', 'HR Policy Legal Advice Checklist', 'match_score', 0.74, 'deviations', jsonb_build_array('Current approved policy not attached', 'Affected employee population needs confirmation'))),
    'risk_highlights', jsonb_build_array(jsonb_build_object('term', 'Policy Applicability', 'risk_level', 'medium', 'reason', 'Scope may affect overtime approval practices across departments.', 'clause_text', 'Policy affects overtime approval process.', 'page', '2')),
    'obligations_summary', jsonb_build_array('Provide the current approved policy.', 'Confirm affected departments and employees.', 'Confirm the intended effective date and implementation process.'),
    'draft_review_note', 'DRAFT REVIEW NOTE — Further background and the current approved policy are required before final legal advice can be prepared.',
    'suggested_questions', jsonb_build_array('Please provide the current approved policy.', 'Which departments and employees will be affected?', 'When is the proposed policy intended to take effect?'),
    'related_precedents', jsonb_build_array(jsonb_build_object('title', 'HR Overtime Policy Review (2025)', 'summary', 'Policy update requiring scope, approval, and implementation review.', 'similarity_score', 0.78, 'source_id', 'PRECEDENT-0061')),
    'disclaimer', 'This output is an AI draft and does not constitute final legal advice or approval.',
    'ai_mode', 'seeded_cloud_demo'
  )
  when 'LA-2026-003' then jsonb_build_object(
    'request_category', 'Research Agreement',
    'category_confidence', 0.92,
    'extracted_clauses', jsonb_build_array(
      jsonb_build_object('clause_title', 'Data Sharing Purpose', 'clause_text', 'The agreement concerns sharing research data with an external partner.', 'location_hint', 'Page 1'),
      jsonb_build_object('clause_title', 'Confidentiality', 'clause_text', 'Confidential research information requires protected handling.', 'location_hint', 'Page 2'),
      jsonb_build_object('clause_title', 'Publication and Intellectual Property', 'clause_text', 'Publication rights and IP ownership require confirmation.', 'location_hint', 'Page 3')
    ),
    'missing_or_unusual_clauses', jsonb_build_array(jsonb_build_object('clause_title', 'Data Retention', 'issue_type', 'missing', 'explanation', 'Confirm retention, deletion, and security requirements for shared data.', 'page', '2')),
    'template_comparisons', jsonb_build_array(jsonb_build_object('template_name', 'Research Collaboration Agreement Template v1.4', 'match_score', 0.8, 'deviations', jsonb_build_array('Confirm data-retention duties', 'Confirm publication-delay rights'))),
    'risk_highlights', jsonb_build_array(jsonb_build_object('term', 'Research Data Handling', 'risk_level', 'high', 'reason', 'External data sharing requires clear security, retention, and access controls.', 'clause_text', 'Data-sharing obligations identified.', 'page', '2')),
    'obligations_summary', jsonb_build_array('Define the permitted data use.', 'Confirm confidentiality and data-security controls.', 'Confirm IP ownership and publication rights.'),
    'draft_review_note', 'DRAFT REVIEW NOTE — The data-sharing agreement can proceed only after confirming data-protection, retention, IP, publication, and liability obligations.',
    'suggested_questions', jsonb_build_array('What data classification applies to the shared dataset?', 'What retention and deletion period will apply?', 'Are publication delays or IP licenses required?'),
    'related_precedents', jsonb_build_array(jsonb_build_object('title', 'Research Collaboration with State Polytechnic (2024)', 'summary', 'Research agreement resolving publication and data-retention terms.', 'similarity_score', 0.84, 'source_id', 'PRECEDENT-0041')),
    'disclaimer', 'This output is an AI draft and does not constitute final legal advice or approval.',
    'ai_mode', 'seeded_cloud_demo'
  )
end,
risk_level = case id when 'LA-2026-001' then 'High' when 'LA-2026-002' then 'Medium' else 'High' end
where id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003');

-- Replace page suggestions for these demo PDFs. HR policy intentionally includes
-- pages 1–3 to match its three-page document.
delete from public.document_ai_suggestions
where document_id in (select id from public.request_documents where request_id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003'));

insert into public.document_ai_suggestions (document_id, page, suggestion_type, suggestion_text)
select d.id, s.page, s.suggestion_type, s.suggestion_text
from public.request_documents d
join (values
  ('LA-2026-001', '1', 'Finance Check', 'AI draft: Confirm payment terms and approval of the payment schedule.'),
  ('LA-2026-001', '2', 'High Risk', 'AI draft: Review liability, indemnity, termination, and data-protection wording.'),
  ('LA-2026-002', '1', 'Clarification', 'AI draft: Confirm the policy purpose and affected employee group.'),
  ('LA-2026-002', '2', 'Risk', 'AI draft: Review the overtime approval process and required internal approvals.'),
  ('LA-2026-002', '3', 'Missing Information', 'AI draft: Request the current approved policy before final legal advice.'),
  ('LA-2026-003', '1', 'Scope', 'AI draft: Confirm the purpose, parties, and permitted use of the shared research data.'),
  ('LA-2026-003', '2', 'High Risk', 'AI draft: Confirm confidentiality, security, retention, and deletion obligations.'),
  ('LA-2026-003', '3', 'Legal Review', 'AI draft: Confirm publication rights, intellectual-property ownership, and governing law.')
) as s(request_id, page, suggestion_type, suggestion_text) on s.request_id = d.request_id;

-- Populate checklist rows for each demo PDF so the internal checklist is usable.
insert into public.request_checklist_items (request_id, document_id, criteria_id, page, checked, note)
select d.request_id, d.id, c.id,
  case when c.sort_order <= 9 then '1' when c.sort_order <= 18 then '2' else '3' end,
  c.sort_order in (1, 2, 3, 4, 7, 8, 12, 21, 22, 25),
  'Seeded AI draft result. Legal Affairs must confirm this item manually.'
from public.request_documents d
cross join public.legal_review_criteria c
where d.request_id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003')
on conflict (request_id, document_id, criteria_id) do update set
  page = excluded.page,
  checked = excluded.checked,
  note = excluded.note;

commit;

-- Verify after running:
-- select id, status, risk_level, ai_review_result is not null as has_ai_result
-- from public.legal_requests where id in ('LA-2026-001', 'LA-2026-002', 'LA-2026-003');
