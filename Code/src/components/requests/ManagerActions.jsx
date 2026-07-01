function ManagerActions({
  request,
  canManageManagerActions,
  onManagerDecisionChange,
}) {
  if (!request) return null;

  const disabledButtonClasses = "cursor-not-allowed opacity-60";

  function updateManagerDecision(nextDecision) {
    if (!canManageManagerActions) return;

    onManagerDecisionChange(nextDecision);

    // BACKEND TODO: PATCH /api/requests/:id/manager-action
    // Save the Legal Manager decision in the backend later.
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Legal Manager Actions</h3>
      <p className="text-sm text-slate-500 mt-1">
        Legal Managers assign reviewers, approve responses, monitor progress,
        and close or escalate requests.
      </p>

      {!canManageManagerActions && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          View-only: this card is visible for transparency, but only the Legal
          Manager can use these manager actions.
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          className={`rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:hover:bg-blue-700 ${
            !canManageManagerActions ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={!canManageManagerActions}
          onClick={() =>
            updateManagerDecision("Response Approved by Legal Manager")
          }
        >
          Approve Response
        </button>
        <button
          className={`rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:hover:bg-white ${
            !canManageManagerActions ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={!canManageManagerActions}
          onClick={() => updateManagerDecision("Closed by Legal Manager")}
        >
          Close Request
        </button>
        <button
          className={`rounded-lg border border-orange-300 px-4 py-3 font-semibold text-orange-700 hover:bg-orange-50 disabled:hover:bg-white ${
            !canManageManagerActions ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={!canManageManagerActions}
          onClick={() => updateManagerDecision("Escalated by Legal Manager")}
        >
          Escalate Request
        </button>
        <button
          className={`rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:hover:bg-white ${
            !canManageManagerActions ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={!canManageManagerActions}
          onClick={() => updateManagerDecision("Reviewer Assignment Started")}
        >
          Assign Reviewer
        </button>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Frontend-only demo buttons. Backend workflow integration will make these
        actions persistent later.
      </p>

      {/* BACKEND TODO: PATCH /api/requests/:id/manager-action */}
    </div>
  );
}

export default ManagerActions;

/*
BEGINNER DOCUMENTATION:

1. Why does Legal Manager have different actions?
The PDF says Legal Managers assign reviewers, approve responses, monitor dashboard, and close or escalate requests.

2. Why are these buttons frontend-only?
Real approval and assignment must be saved and enforced by the backend later.
*/
