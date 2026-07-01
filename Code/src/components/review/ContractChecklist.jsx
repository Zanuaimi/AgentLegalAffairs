import { useEffect, useState } from "react";
import { contractChecklistItems } from "../../data/mockData";

function buildChecklistItems(document) {
  if (document?.checklist) {
    return document.checklist;
  }

  return contractChecklistItems.map((item) => ({
    criteria: item,
    page: "Not reviewed yet",
    note: "AI has not reviewed a PDF for this checklist item yet.",
    checked: false,
  }));
}

function ContractChecklist({ document, canManageReview }) {
  const checklistItems = buildChecklistItems(document);

  // checkedCriteria starts from the AI draft results, then legal staff can adjust it manually.
  const [checkedCriteria, setCheckedCriteria] = useState(() =>
    checklistItems.filter((item) => item.checked).map((item) => item.criteria),
  );

  useEffect(() => {
    setCheckedCriteria(
      checklistItems
        .filter((item) => item.checked)
        .map((item) => item.criteria),
    );
  }, [document]);

  function toggleCriteria(criteria) {
    if (!canManageReview) return;

    const isAlreadyChecked = checkedCriteria.includes(criteria);

    if (isAlreadyChecked) {
      setCheckedCriteria(
        checkedCriteria.filter((checkedItem) => checkedItem !== criteria),
      );
    } else {
      setCheckedCriteria([...checkedCriteria, criteria]);
    }

    // BACKEND TODO: PATCH /api/requests/:id/checklist
    // Save the legal reviewer's manual checklist changes in the backend.
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Contract Review Checklist</h3>
      <p className="text-sm text-slate-500 mt-1">
        AI pre-selects criteria based on the PDF. Legal reviewers can adjust the
        checklist manually in this frontend demo.
      </p>

      {!canManageReview && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Requester view: you can see review progress, but only Legal Affairs
          can change checklist items.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {checklistItems.map((item) => {
          const isChecked = checkedCriteria.includes(item.criteria);

          return (
            <label
              key={`${item.criteria}-${item.page}`}
              className={`block rounded-xl border p-3 ${
                isChecked
                  ? "border-green-200 bg-green-50"
                  : "border-slate-200 bg-slate-50"
              } ${canManageReview ? "cursor-pointer hover:bg-blue-50" : "cursor-not-allowed"}`}
            >
              <div className="flex items-start gap-3">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={isChecked}
                  disabled={!canManageReview}
                  onChange={() => toggleCriteria(item.criteria)}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800 break-words">
                      {item.criteria}
                    </p>
                    {item.checked && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">
                        AI selected
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-600 break-words">
                    {item.note}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                    Page {item.page}
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default ContractChecklist;

/*
BEGINNER DOCUMENTATION:

1. Why is the checklist checked automatically at first?
The AI draft can mark criteria it found in the PDF. That gives reviewers a starting point.

2. Why can legal reviewers change it?
AI is not final. Legal Affairs reviewers need to confirm or correct the checklist manually.

3. Why are requesters blocked from editing it?
Requesters should see the review status, but they should not manage Legal Affairs review work.

4. What does disabled mean on a checkbox?
disabled makes a form control visible but not editable.
*/
