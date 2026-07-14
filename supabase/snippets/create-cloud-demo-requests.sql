-- ONE-TIME CLOUD DEMO REQUEST SETUP
-- Run manually in Supabase Dashboard -> SQL Editor after:
-- 1. `supabase db push` (including migration 202607140014)
-- 2. `create-cloud-demo-accounts.sql`
--
-- This is not a migration. The PDFs are served by the deployed Vercel app from
-- /demo-pdfs, so this script does not add documents to Supabase Storage.

begin;

do $$
begin
  if not exists (
    select 1 from public.profiles
    where id = '00000000-0000-0000-0000-000000000101'
      and username = 'requester1'
  ) then
    raise exception 'Demo accounts are missing. Run create-cloud-demo-accounts.sql first.';
  end if;
end
$$;

insert into public.legal_requests (
  id, title, description, requester_id, department_id, category_code,
  assigned_reviewer_id, assigned_manager_id, priority, risk_level, status,
  deadline, submitted_at, ai_summary, manager_decision, department_decision
) values
  (
    'LA-2026-001', 'Review sample vendor agreement',
    'Requester1 needs Legal Affairs to review a service agreement before signature.',
    '00000000-0000-0000-0000-000000000101', 'legal_affairs', 'LEG-B',
    '00000000-0000-0000-0000-000000000102', null, 'High', 'Medium',
    'AI Review Complete', '2026-07-05', '2026-06-30 09:15:00+04',
    'AI draft: Review payment terms, termination, liability, confidentiality, and signature authority. It is awaiting Reviewer1’s human review.',
    'Pending Legal Manager Review', 'Pending Department Review'
  ),
  (
    'LA-2026-002', 'HR legal opinion on employment policy',
    'Requester2 is requesting legal clarification about an internal employment policy update.',
    '00000000-0000-0000-0000-000000000105', 'legal_affairs', 'LEG-A',
    '00000000-0000-0000-0000-000000000102', null, 'Medium', 'Low',
    'Waiting for More Information', '2026-07-08', '2026-06-30 11:20:00+04',
    'AI draft: More policy background is needed before final legal advice is prepared.',
    'Pending Legal Manager Review', 'Pending Department Review'
  ),
  (
    'LA-2026-003', 'Research data sharing agreement',
    'Requester3 requires review of a data sharing agreement with an external university partner.',
    '00000000-0000-0000-0000-000000000106', 'legal_affairs', 'LEG-C',
    '00000000-0000-0000-0000-000000000107', '00000000-0000-0000-0000-000000000103', 'Urgent', 'High',
    'Sent for Internal Approval', '2026-07-02', '2026-06-30 12:10:00+04',
    'AI draft: Review data usage, confidentiality, publication rights, intellectual property, and liability clauses.',
    'Response Approved by Legal Manager', 'Department Approved'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  requester_id = excluded.requester_id,
  department_id = excluded.department_id,
  category_code = excluded.category_code,
  assigned_reviewer_id = excluded.assigned_reviewer_id,
  assigned_manager_id = excluded.assigned_manager_id,
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

insert into public.reviewer_comments (request_id, reviewer_id, comment_text, created_at) values
  ('LA-2026-002', '00000000-0000-0000-0000-000000000102', 'Requester should provide the current approved policy for comparison.', '2026-06-30 11:35:00+04'),
  ('LA-2026-003', '00000000-0000-0000-0000-000000000107', 'The agreement can proceed for Legal Manager approval.', '2026-06-30 13:05:00+04')
on conflict do nothing;

insert into public.manager_actions (request_id, manager_id, action, note, created_at) values
  ('LA-2026-003', '00000000-0000-0000-0000-000000000103', 'Response Approved by Legal Manager', 'Approved after Reviewer2 completed the review.', '2026-06-30 13:25:00+04')
on conflict do nothing;

insert into public.department_approvals (request_id, approver_id, decision, comment_text, created_at, updated_at) values
  ('LA-2026-003', '00000000-0000-0000-0000-000000000104', 'Department Approved', 'Department Approver LA approved the completed review.', '2026-06-30 13:40:00+04', '2026-06-30 13:40:00+04')
on conflict do nothing;

commit;
