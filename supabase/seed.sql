-- Demo seed data for Legal Affairs Platform
--
-- Easy demo logins after running this seed locally:
--   requester@demo.test   / password123
--   reviewer@demo.test    / password123
--   manager@demo.test     / password123
--   approver@demo.test    / password123
--   admin@demo.test       / password123
--
-- The profile usernames are easy to type too:
--   requester, reviewer, manager, approver, admin

insert into public.roles (id, name) values
  ('requester', 'Requester'),
  ('legal_reviewer', 'Legal Reviewer'),
  ('legal_manager', 'Legal Manager'),
  ('department_approver', 'Department Approver'),
  ('admin_user', 'Admin User'),
  ('owner', 'Owner')
on conflict (id) do update set name = excluded.name;

insert into public.departments (id, name) values
  ('hr', 'HR'),
  ('procurement', 'Procurement'),
  ('research_office', 'Research Office'),
  ('student_affairs', 'Student Affairs'),
  ('finance', 'Finance'),
  ('legal_affairs', 'Legal Affairs'),
  ('academic_affairs', 'Academic Affairs'),
  ('it', 'IT')
on conflict (id) do update set name = excluded.name;

insert into public.legal_categories (code, name) values
  ('LEG-A', 'Legal Advice / Opinion'),
  ('LEG-B', 'Contract Review'),
  ('LEG-C', 'Research Agreements'),
  ('LEG-D', 'Student Agreements'),
  ('LEG-E', 'Committee / Investigation / Disciplinary Matters'),
  ('LEG-F', 'Administrative Legal Work'),
  ('LEG-G', 'Legal Operations / Reporting')
on conflict (code) do update set name = excluded.name;

insert into public.request_statuses (name, sort_order) values
  ('New', 1),
  ('Under Review', 2),
  ('Waiting for More Information', 3),
  ('Assigned to Legal Reviewer', 4),
  ('Draft Response Prepared', 5),
  ('Sent for Internal Approval', 6),
  ('Returned for Revision', 7),
  ('Approved', 8),
  ('Closed', 9),
  ('Archived', 10)
on conflict (name) do update set sort_order = excluded.sort_order;

insert into public.legal_review_criteria (criteria, sort_order) values
  ('Document type identified', 1),
  ('Parties correctly identified', 2),
  ('Request category matches the document', 3),
  ('Request description matches the attached document', 4),
  ('Effective date identified', 5),
  ('Expiry date or end date identified', 6),
  ('Scope clearly defined', 7),
  ('Key obligations summarized', 8),
  ('Payment terms included, if relevant', 9),
  ('Funding terms included, if relevant', 10),
  ('Term and termination clauses included', 11),
  ('Confidentiality clause included', 12),
  ('Data protection clause included, if relevant', 13),
  ('Intellectual property clause included, if relevant', 14),
  ('Publication rights reviewed, if relevant', 15),
  ('Liability and indemnity reviewed', 16),
  ('Insurance requirements reviewed, if relevant', 17),
  ('Governing law and jurisdiction reviewed', 18),
  ('Signature authority confirmed', 19),
  ('Internal approvals obtained or identified', 20),
  ('Missing clauses or missing information identified', 21),
  ('Unusual or high-risk terms highlighted', 22),
  ('Compared against university-approved template or standard position', 23),
  ('Similar past legal opinion or reviewed agreement considered', 24),
  ('Reviewer questions for requester identified', 25),
  ('Final approved response/document storage needed', 26)
on conflict (criteria) do update set sort_order = excluded.sort_order;

-- Seed Supabase Auth users.
-- For hosted Supabase, you may also create these users through the Auth dashboard
-- or a service-role script if direct auth.users inserts are restricted.
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change_token_current,
  email_change,
  phone_change_token,
  reauthentication_token
) values
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'requester@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"requester"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reviewer@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"reviewer"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"manager"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'approver@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"approver"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"admin"}', '', '', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'owner@demo.test', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"username":"owner"}', '', '', '', '', '', '', '')
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  confirmation_token = '',
  recovery_token = '',
  email_change_token_new = '',
  email_change_token_current = '',
  email_change = '',
  phone_change_token = '',
  reauthentication_token = '',
  updated_at = now();

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) values
  ('20000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '{"sub":"00000000-0000-0000-0000-000000000101","email":"requester@demo.test"}', 'email', 'requester@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', '{"sub":"00000000-0000-0000-0000-000000000102","email":"reviewer@demo.test"}', 'email', 'reviewer@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103', '{"sub":"00000000-0000-0000-0000-000000000103","email":"manager@demo.test"}', 'email', 'manager@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000104', '{"sub":"00000000-0000-0000-0000-000000000104","email":"approver@demo.test"}', 'email', 'approver@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000105', '00000000-0000-0000-0000-000000000105', '{"sub":"00000000-0000-0000-0000-000000000105","email":"admin@demo.test"}', 'email', 'admin@demo.test', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000106', '00000000-0000-0000-0000-000000000106', '{"sub":"00000000-0000-0000-0000-000000000106","email":"owner@demo.test"}', 'email', 'owner@demo.test', now(), now(), now())
on conflict (provider, provider_id) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.profiles (id, username, full_name, email, prefix, role_id, department_id, status) values
  ('00000000-0000-0000-0000-000000000101', 'requester', 'Demo Requester', 'requester@demo.test', 'None', 'requester', 'hr', 'Active'),
  ('00000000-0000-0000-0000-000000000102', 'reviewer', 'Omar Hassan', 'reviewer@demo.test', 'Mr.', 'legal_reviewer', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000103', 'manager', 'Fatima Salem', 'manager@demo.test', 'Ms.', 'legal_manager', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000104', 'approver', 'Mariam Ahmed', 'approver@demo.test', 'Ms.', 'department_approver', 'hr', 'Active'),
  ('00000000-0000-0000-0000-000000000105', 'admin', 'Admin User', 'admin@demo.test', 'None', 'admin_user', 'legal_affairs', 'Active'),
  ('00000000-0000-0000-0000-000000000106', 'owner', 'Platform Owner', 'owner@demo.test', 'None', 'owner', 'legal_affairs', 'Active')
on conflict (id) do update set
  username = excluded.username,
  full_name = excluded.full_name,
  email = excluded.email,
  prefix = excluded.prefix,
  role_id = excluded.role_id,
  department_id = excluded.department_id,
  status = excluded.status;

insert into public.legal_requests (
  id, title, description, requester_id, department_id, category_code,
  assigned_reviewer_id, priority, risk_level, status, deadline, submitted_at,
  ai_summary, manager_decision, department_decision
) values
  (
    'LA-2026-001',
    'Review sample vendor agreement',
    'Procurement needs Legal Affairs to review a service agreement before signature.',
    '00000000-0000-0000-0000-000000000101',
    'procurement',
    'LEG-B',
    '00000000-0000-0000-0000-000000000102',
    'High',
    'Medium',
    'Under Review',
    '2026-07-05',
    '2026-06-30 09:15:00+04',
    'AI draft: This appears to be a vendor service agreement. Key review areas include payment terms, termination, liability, confidentiality, and signature authority.',
    'Pending Legal Manager Review',
    'Pending Department Review'
  ),
  (
    'LA-2026-002',
    'HR legal opinion on employment policy',
    'HR is requesting legal clarification about an internal employment policy update.',
    '00000000-0000-0000-0000-000000000101',
    'hr',
    'LEG-A',
    '00000000-0000-0000-0000-000000000102',
    'Medium',
    'Low',
    'Waiting for More Information',
    '2026-07-08',
    '2026-06-30 11:20:00+04',
    'AI draft: This request asks for legal interpretation of an HR policy. More background information may be needed before final advice is prepared.',
    'Pending Legal Manager Review',
    'Pending Department Review'
  ),
  (
    'LA-2026-003',
    'Research data sharing agreement',
    'Research Office requires review of a data sharing agreement with an external university partner.',
    '00000000-0000-0000-0000-000000000101',
    'research_office',
    'LEG-C',
    '00000000-0000-0000-0000-000000000102',
    'Urgent',
    'High',
    'Assigned to Legal Reviewer',
    '2026-07-02',
    '2026-06-30 12:10:00+04',
    'AI draft: This document may involve personal or sensitive research data. Review data usage, confidentiality, publication rights, IP, and liability clauses.',
    'Pending Legal Manager Review',
    'Pending Department Review'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  requester_id = excluded.requester_id,
  department_id = excluded.department_id,
  category_code = excluded.category_code,
  assigned_reviewer_id = excluded.assigned_reviewer_id,
  priority = excluded.priority,
  risk_level = excluded.risk_level,
  status = excluded.status,
  deadline = excluded.deadline,
  submitted_at = excluded.submitted_at,
  ai_summary = excluded.ai_summary,
  manager_decision = excluded.manager_decision,
  department_decision = excluded.department_decision;

insert into public.request_documents (id, request_id, file_name, mime_type, public_url) values
  ('10000000-0000-0000-0000-000000000001', 'LA-2026-001', 'sample_vendor_agreement.pdf', 'application/pdf', '/demo-pdfs/sample_vendor_agreement.pdf'),
  ('10000000-0000-0000-0000-000000000002', 'LA-2026-002', 'HR_Policy_Legal_Opinion.pdf', 'application/pdf', '/demo-pdfs/hr-policy-legal-opinion.pdf'),
  ('10000000-0000-0000-0000-000000000003', 'LA-2026-003', 'Research_Data_Sharing_Agreement.pdf', 'application/pdf', '/demo-pdfs/research-data-sharing-agreement.pdf')
on conflict (id) do update set
  file_name = excluded.file_name,
  mime_type = excluded.mime_type,
  public_url = excluded.public_url;

-- Checklist is generated from the master criteria for every request document.
insert into public.request_checklist_items (request_id, document_id, criteria_id, page, checked, note)
select
  d.request_id,
  d.id,
  c.id,
  case
    when c.sort_order in (1, 3, 4, 7, 8, 21, 22, 25, 26) then '1'
    else 'N/A'
  end as page,
  c.sort_order in (1, 3, 4, 7, 8, 21, 22, 25, 26) as checked,
  case
    when c.sort_order in (1, 3, 4, 7, 8, 21, 22, 25, 26)
      then 'AI draft found related information. Legal Reviewer must confirm manually.'
    else 'AI did not clearly confirm this item. Legal Reviewer should review manually.'
  end as note
from public.request_documents d
cross join public.legal_review_criteria c
on conflict (request_id, document_id, criteria_id) do update set
  page = excluded.page,
  checked = excluded.checked,
  note = excluded.note;

-- Sample vendor agreement checklist tuning for the first request.
-- This keeps the checklist as database rows while making the seed realistic for sample_vendor_agreement.pdf.
update public.request_checklist_items item
set
  checked = tuned.checked,
  page = tuned.page,
  note = tuned.note
from public.legal_review_criteria criteria
join (
  values
    ('Document type identified', true, '1', 'AI draft identifies the uploaded sample as a vendor agreement.'),
    ('Parties correctly identified', true, '1', 'AI draft found the university and vendor parties near the beginning of the sample agreement.'),
    ('Request category matches the document', true, '1', 'The sample document fits LEG-B Contract Review / Vendor Agreement review.'),
    ('Request description matches the attached document', true, '1', 'The request asks Legal Affairs to review a vendor agreement, matching the sample PDF.'),
    ('Effective date identified', true, '1', 'AI draft found agreement timing/effective-date language, but Legal Reviewer should confirm exact date.'),
    ('Expiry date or end date identified', false, 'N/A', 'AI did not clearly confirm the end date. Reviewer should verify term and renewal language.'),
    ('Scope clearly defined', true, '1', 'AI draft found a scope/services section describing vendor obligations.'),
    ('Key obligations summarized', true, '1', 'AI draft can summarize payment, service, confidentiality, and termination obligations.'),
    ('Payment terms included, if relevant', true, '1', 'Payment terms appear to be included and should be confirmed with Finance if required.'),
    ('Funding terms included, if relevant', false, 'N/A', 'No separate funding terms were clearly identified in the sample vendor agreement.'),
    ('Term and termination clauses included', true, '2', 'AI draft found term/termination wording, including renewal or cancellation language.'),
    ('Confidentiality clause included', true, '2', 'Confidentiality language appears to be present.'),
    ('Data protection clause included, if relevant', false, 'N/A', 'AI draft did not find strong FERPA/data security language. This should be requested if vendor handles university data.'),
    ('Intellectual property clause included, if relevant', false, 'N/A', 'AI did not clearly identify IP ownership/license terms. Reviewer should check whether software/service deliverables create IP concerns.'),
    ('Publication rights reviewed, if relevant', false, 'N/A', 'Publication rights do not appear relevant for this vendor agreement.'),
    ('Liability and indemnity reviewed', false, '2', 'AI draft flagged liability/indemnity as needing manual Legal Affairs review.'),
    ('Insurance requirements reviewed, if relevant', false, 'N/A', 'AI draft did not find insurance requirements. Vendor insurance language may be missing.'),
    ('Governing law and jurisdiction reviewed', false, 'N/A', 'Governing law should be checked against university standard position.'),
    ('Signature authority confirmed', false, 'N/A', 'Signature authority is not confirmed from the sample PDF alone.'),
    ('Internal approvals obtained or identified', false, 'N/A', 'Finance/procurement approvals should be confirmed before signature.'),
    ('Missing clauses or missing information identified', true, '3', 'AI draft flags missing data security, insurance, and possibly governing-law/signature information.'),
    ('Unusual or high-risk terms highlighted', true, '2', 'AI draft highlights liability cap, auto-renewal, and missing data protection as risk areas.'),
    ('Compared against university-approved template or standard position', true, '3', 'AI draft compares the sample to the Vendor Services Agreement Template v2.1.'),
    ('Similar past legal opinion or reviewed agreement considered', true, '3', 'AI draft references the CloudSoft vendor agreement precedent as a related example.'),
    ('Reviewer questions for requester identified', true, '3', 'AI draft suggests asking about data processing, insurance, renewal period, and liability cap.'),
    ('Final approved response/document storage needed', true, '3', 'Final reviewed version should be stored in the request record after Legal Affairs approval.')
) as tuned(criteria_text, checked, page, note)
  on tuned.criteria_text = criteria.criteria
where item.request_id = 'LA-2026-001'
  and item.document_id = '10000000-0000-0000-0000-000000000001'
  and item.criteria_id = criteria.id;

insert into public.document_ai_suggestions (document_id, page, suggestion_type, suggestion_text) values
  ('10000000-0000-0000-0000-000000000001', '1', 'Finance Check', 'AI draft: Payment terms in sample_vendor_agreement.pdf should be confirmed by Finance before Legal Affairs approves the agreement.'),
  ('10000000-0000-0000-0000-000000000001', '2', 'Risk', 'AI draft: The liability cap appears low. Consider requesting stronger liability and indemnity wording.'),
  ('10000000-0000-0000-0000-000000000002', '1', 'Clarification', 'AI draft: Ask HR whether the policy applies to all departments or only selected units.'),
  ('10000000-0000-0000-0000-000000000003', '3', 'Missing Clause', 'AI draft: Governing law is missing. Add UAE law or the university-approved standard clause.')
on conflict do nothing;

insert into public.reviewer_comments (request_id, reviewer_id, comment_text, created_at) values
  ('LA-2026-001', '00000000-0000-0000-0000-000000000102', 'Please confirm whether Finance has reviewed the payment schedule.', '2026-06-30 10:10:00+04'),
  ('LA-2026-001', '00000000-0000-0000-0000-000000000102', 'Liability clause needs additional review before approval.', '2026-06-30 10:30:00+04'),
  ('LA-2026-002', '00000000-0000-0000-0000-000000000102', 'Requester should provide the current approved policy for comparison.', '2026-06-30 11:35:00+04')
on conflict do nothing;

insert into public.audit_logs (request_id, action, actor_id, actor_name, created_at) values
  ('LA-2026-001', 'Request created', '00000000-0000-0000-0000-000000000101', 'Demo Requester', '2026-06-30 09:15:00+04'),
  ('LA-2026-001', 'Document uploaded', '00000000-0000-0000-0000-000000000101', 'Demo Requester', '2026-06-30 09:17:00+04'),
  ('LA-2026-001', 'Assigned to Legal Reviewer', '00000000-0000-0000-0000-000000000103', 'Fatima Salem', '2026-06-30 10:05:00+04'),
  ('LA-2026-002', 'Additional information requested', '00000000-0000-0000-0000-000000000102', 'Omar Hassan', '2026-06-30 11:20:00+04'),
  ('LA-2026-003', 'AI draft summary generated', null, 'AI Assistant', '2026-06-30 12:10:00+04')
on conflict do nothing;

-- Full sample request for backend testing:
-- requester submits it, AI reviews it, and Legal Reviewer comments on it.
insert into public.legal_requests (
  id, title, description, requester_id, department_id, category_code,
  assigned_reviewer_id, priority, risk_level, status, deadline, submitted_at,
  ai_summary, ai_review_result, manager_decision, department_decision
) values (
  'LA-2026-004',
  'AI reviewed software license agreement',
  'Requester needs Legal Affairs to review a software license agreement before the university signs with the vendor.',
  '00000000-0000-0000-0000-000000000101',
  'it',
  'LEG-B',
  '00000000-0000-0000-0000-000000000102',
  'High',
  'High',
  'Under Review',
  '2026-07-12',
  '2026-07-01 09:30:00+04',
  'AI draft: The software license includes a broad liability cap, auto-renewal language, data processing obligations, and missing insurance wording. Human Legal Affairs review is required before any approval.',
  '{
    "request_category": "Vendor Agreement",
    "category_confidence": 0.91,
    "extracted_clauses": [
      {
        "clause_title": "License Grant",
        "clause_text": "Vendor grants the university a non-exclusive license to use the platform for academic and administrative purposes.",
        "location_hint": "Section 1"
      },
      {
        "clause_title": "Payment Terms",
        "clause_text": "University shall pay annual subscription fees within 30 days of invoice.",
        "location_hint": "Section 4"
      },
      {
        "clause_title": "Auto-Renewal",
        "clause_text": "The agreement renews automatically for successive one-year terms unless cancelled 90 days before renewal.",
        "location_hint": "Section 7"
      },
      {
        "clause_title": "Limitation of Liability",
        "clause_text": "Vendor liability is capped at fees paid in the previous twelve months.",
        "location_hint": "Section 10"
      }
    ],
    "missing_or_unusual_clauses": [
      {
        "clause_title": "Insurance Requirements",
        "issue_type": "missing",
        "explanation": "The agreement does not require vendor insurance coverage, which is expected in the university vendor template."
      },
      {
        "clause_title": "Data Security / FERPA Compliance",
        "issue_type": "missing",
        "explanation": "The vendor may process university user data, but the document does not include clear FERPA/data security obligations."
      },
      {
        "clause_title": "Auto-Renewal Notice Period",
        "issue_type": "unusual",
        "explanation": "The 90-day cancellation window is longer than the university preferred position."
      }
    ],
    "template_comparisons": [
      {
        "template_name": "Vendor Services Agreement Template v2.1",
        "match_score": 0.62,
        "deviations": [
          "Missing insurance clause",
          "Missing FERPA/data security wording",
          "Auto-renewal notice period is longer than standard",
          "Liability cap may be too low for data-related claims"
        ]
      }
    ],
    "risk_highlights": [
      {
        "term": "Limitation of Liability",
        "risk_level": "high",
        "reason": "The cap may be insufficient if a data incident or service failure causes university losses.",
        "clause_text": "Vendor liability is capped at fees paid in the previous twelve months."
      },
      {
        "term": "Data Processing",
        "risk_level": "high",
        "reason": "The agreement lacks clear data protection and breach notification responsibilities.",
        "clause_text": "No dedicated data security clause identified."
      },
      {
        "term": "Auto-Renewal",
        "risk_level": "medium",
        "reason": "A 90-day notice requirement may make it difficult for the university to stop renewal on time.",
        "clause_text": "Cancelled 90 days before renewal."
      }
    ],
    "obligations_summary": [
      "Pay annual subscription fees within 30 days of invoice.",
      "Use the software only for academic and administrative purposes.",
      "Comply with vendor acceptable-use restrictions.",
      "Track renewal deadline at least 90 days before expiry.",
      "Confirm data protection controls before signing."
    ],
    "draft_review_note": "DRAFT REVIEW NOTE — The software license agreement requires revisions before signature. Key issues include missing insurance requirements, missing FERPA/data protection language, a broad liability cap, and a long auto-renewal cancellation window. This is an AI draft for Legal Affairs review only and is not final approval.",
    "suggested_questions": [
      "Can the vendor add FERPA/data security and breach notification language?",
      "Can the vendor provide evidence of insurance coverage?",
      "Can the auto-renewal notice period be reduced from 90 days to 30 days?",
      "Can the liability cap exclude confidentiality, data breach, and indemnity claims?"
    ],
    "related_precedents": [
      {
        "title": "Vendor Agreement with CloudSoft Inc. (2023)",
        "document_type": "Vendor Agreement",
        "summary": "SaaS vendor agreement; required FERPA data processing addendum and breach notification clause.",
        "similarity_score": 0.84,
        "source_id": "PRECEDENT-0027"
      }
    ],
    "disclaimer": "This output was generated by an AI assistant and does not constitute a final legal decision. All outputs must be reviewed and approved by Legal Affairs.",
    "ai_mode": "seeded_sample"
  }'::jsonb,
  'Pending Legal Manager Review',
  'Pending Department Review'
)
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  requester_id = excluded.requester_id,
  department_id = excluded.department_id,
  category_code = excluded.category_code,
  assigned_reviewer_id = excluded.assigned_reviewer_id,
  priority = excluded.priority,
  risk_level = excluded.risk_level,
  status = excluded.status,
  deadline = excluded.deadline,
  submitted_at = excluded.submitted_at,
  ai_summary = excluded.ai_summary,
  ai_review_result = excluded.ai_review_result,
  manager_decision = excluded.manager_decision,
  department_decision = excluded.department_decision;

insert into public.request_documents (id, request_id, file_name, mime_type, public_url) values
  ('10000000-0000-0000-0000-000000000004', 'LA-2026-004', 'Software_License_Agreement_AI_Reviewed.pdf', 'application/pdf', '/demo-pdfs/vendor-service-agreement.pdf')
on conflict (id) do update set
  file_name = excluded.file_name,
  mime_type = excluded.mime_type,
  public_url = excluded.public_url;

insert into public.request_checklist_items (request_id, document_id, criteria_id, page, checked, note)
select
  'LA-2026-004',
  '10000000-0000-0000-0000-000000000004',
  c.id,
  case
    when c.criteria in (
      'Document type identified',
      'Parties correctly identified',
      'Request category matches the document',
      'Request description matches the attached document',
      'Scope clearly defined',
      'Key obligations summarized',
      'Payment terms included, if relevant',
      'Missing clauses or missing information identified',
      'Unusual or high-risk terms highlighted',
      'Compared against university-approved template or standard position',
      'Similar past legal opinion or reviewed agreement considered',
      'Reviewer questions for requester identified'
    ) then '1'
    else 'N/A'
  end,
  c.criteria in (
    'Document type identified',
    'Parties correctly identified',
    'Request category matches the document',
    'Request description matches the attached document',
    'Scope clearly defined',
    'Key obligations summarized',
    'Payment terms included, if relevant',
    'Missing clauses or missing information identified',
    'Unusual or high-risk terms highlighted',
    'Compared against university-approved template or standard position',
    'Similar past legal opinion or reviewed agreement considered',
    'Reviewer questions for requester identified'
  ),
  case
    when c.criteria = 'Data protection clause included, if relevant'
      then 'AI flagged this as missing. Legal Reviewer should request FERPA/data security wording.'
    when c.criteria = 'Insurance requirements reviewed, if relevant'
      then 'AI flagged this as missing. Legal Reviewer should ask for insurance requirements or evidence.'
    when c.criteria = 'Liability and indemnity reviewed'
      then 'AI highlighted liability cap as high risk. Legal Reviewer should review manually.'
    when c.criteria in (
      'Document type identified',
      'Parties correctly identified',
      'Request category matches the document',
      'Request description matches the attached document',
      'Scope clearly defined',
      'Key obligations summarized',
      'Payment terms included, if relevant',
      'Missing clauses or missing information identified',
      'Unusual or high-risk terms highlighted',
      'Compared against university-approved template or standard position',
      'Similar past legal opinion or reviewed agreement considered',
      'Reviewer questions for requester identified'
    ) then 'AI draft review found related information. Legal Reviewer must confirm before relying on it.'
    else 'AI did not clearly confirm this item. Legal Reviewer should review manually.'
  end
from public.legal_review_criteria c
on conflict (request_id, document_id, criteria_id) do update set
  page = excluded.page,
  checked = excluded.checked,
  note = excluded.note;

insert into public.document_ai_suggestions (document_id, page, suggestion_type, suggestion_text) values
  ('10000000-0000-0000-0000-000000000004', '1', 'High Risk', 'AI draft: Liability cap may be too low for data breach or service failure claims.'),
  ('10000000-0000-0000-0000-000000000004', '2', 'Missing Clause', 'AI draft: Add FERPA/data security and breach notification language.'),
  ('10000000-0000-0000-0000-000000000004', '3', 'Template Deviation', 'AI draft: Vendor template does not include university insurance requirements.'),
  ('10000000-0000-0000-0000-000000000004', '4', 'Requester Question', 'AI draft: Ask whether the vendor can reduce auto-renewal notice to 30 days.')
on conflict do nothing;

insert into public.reviewer_comments (request_id, reviewer_id, comment_text, created_at) values
  ('LA-2026-004', '00000000-0000-0000-0000-000000000102', 'I reviewed the AI draft. Please ask the requester whether student or employee data will be processed by this software.', '2026-07-01 11:00:00+04'),
  ('LA-2026-004', '00000000-0000-0000-0000-000000000102', 'The liability cap and missing data protection language should be revised before this can proceed.', '2026-07-01 11:20:00+04')
on conflict do nothing;

insert into public.audit_logs (request_id, action, actor_id, actor_name, created_at) values
  ('LA-2026-004', 'Request created', '00000000-0000-0000-0000-000000000101', 'Demo Requester', '2026-07-01 09:30:00+04'),
  ('LA-2026-004', 'AI legal review generated', null, 'AI Assistant', '2026-07-01 09:32:00+04'),
  ('LA-2026-004', 'Reviewer comments added', '00000000-0000-0000-0000-000000000102', 'Omar Hassan', '2026-07-01 11:20:00+04')
on conflict do nothing;
