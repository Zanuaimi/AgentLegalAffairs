function AiChecklistStatus({ checked }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
        checked
          ? "bg-green-100 text-green-700"
          : "bg-orange-100 text-orange-700"
      }`}
    >
      {checked ? "AI Found" : "Needs Review"}
    </span>
  );
}

function PdfReviewModal({ document, onClose }) {
  if (!document) return null;

  const checklist = document.checklist || [];
  const aiSuggestions = document.aiSuggestions || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 p-3 sm:p-4">
      <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="shrink-0 border-b border-slate-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                PDF Review Popup
              </p>
              <h2 className="break-words text-lg font-bold text-slate-900 sm:text-xl">
                {document.name}
              </h2>
              <p className="text-sm text-slate-500">
                PDF on the left. AI checklist and AI page suggestions on the
                right.
              </p>
            </div>

            <button
              type="button"
              className="shrink-0 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700"
              onClick={onClose}
            >
              Close PDF View
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-h-[50vh] bg-slate-100 xl:min-h-0">
            <iframe
              className="h-full min-h-[50vh] w-full border-0 xl:min-h-0"
              src={document.url}
              title={`PDF viewer for ${document.name}`}
            />
          </div>

          <aside className="flex min-h-0 flex-col border-l border-slate-200 bg-slate-50">
            <section className="flex min-h-0 flex-1 flex-col border-b border-slate-200 p-4">
              <div className="shrink-0 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  AI Checklist by Page
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Read-only AI draft status for each legal review criterion.
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
                {checklist.map((item) => (
                  <article
                    key={`${item.criteria}-${item.page}`}
                    className="rounded-xl bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="min-w-0 break-words text-sm font-bold leading-snug text-slate-800">
                        {item.criteria}
                      </h4>
                      <AiChecklistStatus checked={item.checked} />
                    </div>

                    <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      Page {item.page}
                    </span>

                    <p className="mt-2 break-words text-sm leading-relaxed text-slate-600">
                      {item.note}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="flex min-h-0 flex-1 flex-col p-4">
              <div className="shrink-0 pb-3">
                <h3 className="text-base font-bold text-slate-900">
                  AI Suggestions by Page
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Draft support only. Legal Affairs must make the final
                  decision.
                </p>
              </div>

              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-2">
                {aiSuggestions.map((suggestion) => (
                  <article
                    key={`${suggestion.page}-${suggestion.text}`}
                    className="rounded-xl border border-blue-200 bg-blue-50 p-3"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-blue-700">
                        Page {suggestion.page}
                      </span>
                      <span className="break-words text-right text-[11px] font-bold uppercase tracking-wide text-blue-700">
                        {suggestion.type}
                      </span>
                    </div>
                    <p className="break-words text-sm leading-relaxed text-slate-700">
                      {suggestion.text}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PdfReviewModal;

/*
BEGINNER DOCUMENTATION:

1. What is a modal?
A modal is a popup layer that appears above the normal page. Here it lets the user review a PDF without leaving Request Details.

2. What is an iframe?
<iframe> can show another document inside the page. We use it to show the PDF with the browser's built-in PDF viewer.

3. Why are checklist and AI suggestions scrollable separately?
Each panel has its own scrolling area so long checklist text cannot collide with the AI suggestions section.

4. Why are there no checkboxes here?
The checklist is now AI-prechecked demo data. The popup displays AI draft status instead of asking the reviewer to toggle items.

5. Is this real AI?
No. This is frontend demo data. Real AI suggestions would come from backend/AI work owned outside this frontend scope.
*/
