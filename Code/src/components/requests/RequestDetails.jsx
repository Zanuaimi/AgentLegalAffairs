import { useEffect, useState } from "react";
import AiLegalReviewPanel from "../review/AiLegalReviewPanel";
import AiSummaryBox from "../review/AiSummaryBox";
import ContractChecklist from "../review/ContractChecklist";
import ReviewerComments from "../review/ReviewerComments";
import DepartmentApprovalPanel from "./DepartmentApprovalPanel";
import ManagerActions from "./ManagerActions";
import PdfReviewModal from "./PdfReviewModal";

function ReviewStatusCard({
  request,
  document,
  canManageReview,
  canManageManagerActions,
  canManageDepartmentApproval,
  showChecklistProgress,
}) {
  const checklistItems = document?.checklist || [];
  const completedItems = checklistItems.filter((item) => item.checked).length;
  const totalItems = checklistItems.length;
  const departmentDecision = request.departmentDecision;
  const managerDecision = request.managerDecision;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Review Status</h3>
      <p className="text-sm text-slate-500 mt-1">
        This card summarizes who can act on this request and what is still
        pending.
      </p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500">Current Request Status</p>
          <p className="mt-1 font-bold text-slate-900">{request.status}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500">Legal Reviewer</p>
          <p className="mt-1 font-bold text-slate-900">
            {request.assignedReviewer || "Not assigned"}
          </p>
        </div>
        {showChecklistProgress && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">AI Checklist Progress</p>
            <p className="mt-1 font-bold text-slate-900">
              {totalItems === 0
                ? "No PDF checklist yet"
                : `${completedItems} of ${totalItems} AI-selected`}
            </p>
          </div>
        )}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500">Department Review</p>
          <p className="mt-1 font-bold text-slate-900">{departmentDecision}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500">Legal Manager Review</p>
          <p className="mt-1 font-bold text-slate-900">{managerDecision}</p>
        </div>
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
          <p className="text-slate-500">Your Access on This Page</p>
          <p className="mt-1 font-bold text-slate-900">
            {canManageReview
              ? "Legal Reviewer actions enabled"
              : canManageManagerActions
                ? "Legal Manager actions enabled"
                : canManageDepartmentApproval
                  ? "Department actions enabled"
                  : "View-only"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AiQueueDebugCard({ request }) {
  const job = request.aiReviewJob;
  const statusColors = {
    queued: "bg-amber-100 text-amber-800 border-amber-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };

  const statusClass = job
    ? statusColors[job.status] || "bg-slate-100 text-slate-800 border-slate-200"
    : "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">AI Review Queue Debug</h3>
          <p className="text-sm text-slate-500 mt-1">
            Shows the backend-saved AI queue state for this request. This is for
            local debugging and Legal Affairs transparency.
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass}`}>
          {job ? job.status : "No queue job"}
        </span>
      </div>

      {!job ? (
        <p className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-600">
          No AI queue row is attached to this request yet. If this is a new PDF
          request, check whether the request was saved before the queue migration
          was applied.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Queue Job ID</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-900">{job.id}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Current Queue Position</p>
            <p className="mt-1 font-bold text-slate-900">
              {job.queuePosition ? `#${job.queuePosition}` : "Not in active queue"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Position counts queued/processing jobs from oldest to newest.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Attempts</p>
            <p className="mt-1 font-bold text-slate-900">{job.attemptCount}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Queued At</p>
            <p className="mt-1 font-semibold text-slate-900">{job.createdAt}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Started At</p>
            <p className="mt-1 font-semibold text-slate-900">{job.startedAt}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Completed At</p>
            <p className="mt-1 font-semibold text-slate-900">{job.completedAt}</p>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
            <p className="text-slate-500">Last Updated</p>
            <p className="mt-1 font-semibold text-slate-900">{job.updatedAt}</p>
          </div>
          {job.lastError && (
            <div className="md:col-span-2 rounded-xl bg-red-50 border border-red-200 p-3">
              <p className="font-semibold text-red-800">Last Error</p>
              <p className="mt-1 whitespace-pre-wrap text-red-700">{job.lastError}</p>
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Refresh behavior: while any request is pending/processing AI review, the
        app polls Supabase every few seconds so this panel can update.
      </p>
    </div>
  );
}

function RequestDetails({
  request,
  currentUser,
  canManageReview,
  canManageManagerActions,
  canManageDepartmentApproval,
  onAddComment,
  onManagerDecisionChange,
  onDepartmentDecisionChange,
  onChecklistItemToggle,
}) {
  // selectedDocument stores the PDF the user clicked, so we can show it in the popup.
  const [selectedDocument, setSelectedDocument] = useState(null);

  // These two pieces of state make the status card update immediately after Supabase workflow saves.
  const [managerDecision, setManagerDecision] = useState(
    "Pending Legal Manager Review",
  );
  const [departmentDecision, setDepartmentDecision] = useState(
    "Pending Department Review",
  );

  useEffect(() => {
    if (!request) return;

    setManagerDecision(
      request.managerDecision || "Pending Legal Manager Review",
    );
    setDepartmentDecision(
      request.departmentDecision || "Pending Department Review",
    );
  }, [request]);

  if (!request) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Request Details</h2>
        <p className="text-slate-500 mt-2">
          Select a legal request from the Legal Requests page to view details.
        </p>
      </section>
    );
  }

  const firstDocument = request.documents[0];
  const isRequester = currentUser?.role === "Requester";

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Request Details</h2>
        <p className="text-slate-500 mt-1">
          Review request information, current status, PDF attachment, and reviewer notes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{request.id}</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {request.title}
                </h3>
                <p className="text-slate-600 mt-3">{request.description}</p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                {request.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
              <p>
                <span className="font-semibold">Category:</span>{" "}
                {request.categoryCode} - {request.categoryName}
              </p>
              <p>
                <span className="font-semibold">Department:</span>{" "}
                {request.department}
              </p>
              <p>
                <span className="font-semibold">Requester:</span>{" "}
                {request.requester}
              </p>
              <p>
                <span className="font-semibold">Assigned Reviewer:</span>{" "}
                {request.assignedReviewer}
              </p>
              <p>
                <span className="font-semibold">Priority:</span>{" "}
                {request.priority}
              </p>
              <p>
                <span className="font-semibold">Risk Level:</span>{" "}
                {request.riskLevel}
              </p>
              <p>
                <span className="font-semibold">Deadline:</span>{" "}
                {request.deadline}
              </p>
              <p>
                <span className="font-semibold">Sent Time:</span>{" "}
                {request.submittedAt || "Not recorded"}
              </p>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-slate-900">PDF Attachments</h4>
              <p className="text-sm text-slate-500 mt-1">
                Click a PDF to open the review popup with AI page suggestions.
              </p>
              <ul className="mt-3 space-y-2">
                {request.documents.length === 0 ? (
                  <li className="text-sm text-slate-500">No PDF uploaded.</li>
                ) : (
                  request.documents.map((document) => {
                    const documentName = document.name || document;

                    return (
                      <li key={documentName}>
                        <button
                          type="button"
                          className="w-full rounded-lg bg-slate-50 p-3 text-left text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:underline"
                          onClick={() => setSelectedDocument(document)}
                        >
                          📄 {documentName}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          <AiSummaryBox summary={request.aiSummary} />
          <AiQueueDebugCard request={request} />
          <AiLegalReviewPanel review={request.aiReviewResult} />
          <ReviewStatusCard
            request={{ ...request, managerDecision, departmentDecision }}
            document={firstDocument}
            canManageReview={canManageReview}
            canManageManagerActions={canManageManagerActions}
            canManageDepartmentApproval={canManageDepartmentApproval}
            showChecklistProgress={!isRequester}
          />
          {canManageManagerActions && (
            <ManagerActions
              request={request}
              canManageManagerActions={canManageManagerActions}
              onManagerDecisionChange={async (nextDecision) => {
                const savedDecision = await onManagerDecisionChange(nextDecision);
                setManagerDecision(savedDecision.managerDecision);
              }}
            />
          )}
          {canManageDepartmentApproval && (
            <DepartmentApprovalPanel
              request={request}
              canManageDepartmentApproval={canManageDepartmentApproval}
              decision={departmentDecision}
              onDecisionChange={async (nextDecision, commentText) => {
                const savedDecision = await onDepartmentDecisionChange(
                  nextDecision,
                  commentText,
                );
                setDepartmentDecision(savedDecision.departmentDecision);
              }}
            />
          )}
          <ReviewerComments
            initialComments={request.reviewerComments}
            currentUser={currentUser}
            onAddComment={onAddComment}
          />
        </div>

        {!isRequester && (
          <ContractChecklist
            requestId={request.id}
            document={firstDocument}
            canManageReview={canManageReview}
            onChecklistItemToggle={onChecklistItemToggle}
          />
        )}
      </div>

      {selectedDocument && (
        <PdfReviewModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}

    </section>
  );
}

export default RequestDetails;

/*
BEGINNER DOCUMENTATION:

1. What is early return?
If no request is selected, we return a simple message before rendering the full details page.

2. What is component composition?
RequestDetails uses smaller components inside it: AiSummaryBox, ReviewerComments, ContractChecklist, and PdfReviewModal.

3. What is role-specific rendering?
Some panels only appear for the role that can act on them. Legal Manager actions are visible only to Legal Managers, and Department Approval is visible only to Department Approvers.

4. What is responsive layout?
Tailwind classes like grid-cols-1 and xl:grid-cols-3 change the layout depending on screen size.

5. Why click the PDF instead of always showing it?
Opening the PDF in a popup keeps the details page clean and gives reviewers a focused document-review workspace.
*/
