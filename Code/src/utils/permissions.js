export function canManageReview(role) {
  return role === "Legal Reviewer";
}

export function canManageManagerActions(role) {
  return role === "Legal Manager";
}

export function canManageDepartmentApproval(role) {
  return role === "Department Approver";
}

export function canViewAuditLog(role) {
  return role === "Admin User";
}

/*
BEGINNER DOCUMENTATION:

1. Why split permissions by role?
The Legal Affairs PDF gives each role different responsibilities. Legal Reviewers review documents, Legal Managers assign/approve/close, and Department Approvers handle department approval.

2. Is this enough security?
No. These helpers only decide what to display. Supabase RLS policies must also enforce permissions on every table.
*/
