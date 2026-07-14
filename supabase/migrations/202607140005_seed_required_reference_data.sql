-- Required production reference data.
-- This intentionally excludes local demo Auth accounts, demo requests, and demo PDFs
-- from supabase/seed.sql. It lets a hosted project support real registration safely.

insert into public.roles (id, name) values
  ('requester', 'Requester'),
  ('legal_reviewer', 'Legal Reviewer'),
  ('legal_manager', 'Legal Manager'),
  ('department_approver', 'Department Approver'),
  ('admin_user', 'Admin User')
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
  ('Archived', 10),
  ('AI Review Pending', 11),
  ('AI Review Processing', 12),
  ('AI Review Complete', 13),
  ('AI Review Failed', 14)
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
