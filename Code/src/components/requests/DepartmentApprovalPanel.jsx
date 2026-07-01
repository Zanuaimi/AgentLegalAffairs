import { useState } from "react";

function DepartmentApprovalPanel({
  request,
  canManageDepartmentApproval,
  decision,
  onDecisionChange,
}) {
  const [departmentComment, setDepartmentComment] = useState("");

  if (!request) return null;

  function approveDepartmentContent() {
    if (!canManageDepartmentApproval) return;

    onDecisionChange("Department Approved");

    // BACKEND TODO: POST /api/requests/:id/department-approval
    // Save department approval decision and comment in the backend later.
  }

  function requestRevision() {
    if (!canManageDepartmentApproval) return;

    onDecisionChange("Department Requested Revision");

    // BACKEND TODO: POST /api/requests/:id/department-approval
    // Save department revision decision and comment in the backend later.
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Department Approval</h3>
      <p className="text-sm text-slate-500 mt-1">
        Department Approvers review department-specific content, approve, or add
        a department comment. They do not manage Legal Affairs checklist work.
      </p>

      {!canManageDepartmentApproval && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          View-only: this card is visible for transparency, but only the
          Department Approver can use department approval actions.
        </div>
      )}

      <div className="mt-4 rounded-xl bg-blue-50 border border-blue-200 p-3 text-sm text-blue-900">
        Current department decision:{" "}
        <span className="font-bold">{decision}</span>
      </div>

      <label className="mt-4 block">
        <span className="block text-sm font-medium text-slate-700 mb-1">
          Department Comment
        </span>
        <textarea
          className="w-full rounded-lg border border-slate-300 px-4 py-3 min-h-28 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
          value={departmentComment}
          onChange={(event) => setDepartmentComment(event.target.value)}
          placeholder="Add department-specific approval notes or revision comments."
          disabled={!canManageDepartmentApproval}
        />
      </label>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <button
          className="flex-1 rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-green-700"
          type="button"
          onClick={approveDepartmentContent}
          disabled={!canManageDepartmentApproval}
        >
          Approve Department Content
        </button>
        <button
          className="flex-1 rounded-lg border border-orange-300 px-4 py-3 font-semibold text-orange-700 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white"
          type="button"
          onClick={requestRevision}
          disabled={!canManageDepartmentApproval}
        >
          Request Revision
        </button>
      </div>
    </div>
  );
}

export default DepartmentApprovalPanel;

/*
BEGINNER DOCUMENTATION:

1. What does Department Approver do?
The PDF says this role reviews department-specific content and can approve or comment.

2. Why not edit the Legal Affairs checklist?
The checklist is Legal Affairs review work. Department Approver focuses on department approval only.
*/
