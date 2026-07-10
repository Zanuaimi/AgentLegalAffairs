import { useState } from "react";

function ManagerActions({
  request,
  canManageManagerActions,
  onManagerDecisionChange,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!request) return null;

  const disabledButtonClasses = "cursor-not-allowed opacity-60";
  const actionsDisabled = !canManageManagerActions || isSaving;

  async function updateManagerDecision(nextDecision) {
    if (!canManageManagerActions || isSaving) return;

    setIsSaving(true);
    setErrorMessage("");

    try {
      await onManagerDecisionChange(nextDecision);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save manager action.",
      );
    } finally {
      setIsSaving(false);
    }
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
            actionsDisabled ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={actionsDisabled}
          onClick={() =>
            updateManagerDecision("Response Approved by Legal Manager")
          }
        >
          Approve Response
        </button>
        <button
          className={`rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:hover:bg-white ${
            actionsDisabled ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={actionsDisabled}
          onClick={() => updateManagerDecision("Closed by Legal Manager")}
        >
          Close Request
        </button>
        <button
          className={`rounded-lg border border-orange-300 px-4 py-3 font-semibold text-orange-700 hover:bg-orange-50 disabled:hover:bg-white ${
            actionsDisabled ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={actionsDisabled}
          onClick={() => updateManagerDecision("Escalated by Legal Manager")}
        >
          Escalate Request
        </button>
        <button
          className={`rounded-lg border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:hover:bg-white ${
            actionsDisabled ? disabledButtonClasses : ""
          }`}
          type="button"
          disabled={actionsDisabled}
          onClick={() => updateManagerDecision("Reviewer Assignment Started")}
        >
          Assign Reviewer
        </button>
      </div>

      {isSaving && (
        <p className="mt-4 text-xs font-semibold text-blue-700">
          Saving manager action to Supabase...
        </p>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Manager decisions are saved to Supabase and update the request status.
      </p>
    </div>
  );
}

export default ManagerActions;

/*
BEGINNER DOCUMENTATION:

1. Why does Legal Manager have different actions?
The PDF says Legal Managers assign reviewers, approve responses, monitor dashboard, and close or escalate requests.

2. Why do these buttons save through Supabase?
Manager decisions affect workflow state, so they are persisted in manager_actions and legal_requests instead of staying only in browser state.
*/
