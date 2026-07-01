import AiSummaryBox from '../review/AiSummaryBox';
import ContractChecklist from '../review/ContractChecklist';
import ReviewerComments from '../review/ReviewerComments';

function RequestDetails({ request }) {
  if (!request) {
    return (
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Request Details</h2>
        <p className="text-slate-500 mt-2">Select a legal request from the Legal Requests page to view details.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Request Details</h2>
        <p className="text-slate-500 mt-1">Review request information, AI draft, checklist, comments, and documents.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{request.id}</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{request.title}</h3>
                <p className="text-slate-600 mt-3">{request.description}</p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                {request.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm">
              <p><span className="font-semibold">Category:</span> {request.categoryCode} - {request.categoryName}</p>
              <p><span className="font-semibold">Department:</span> {request.department}</p>
              <p><span className="font-semibold">Requester:</span> {request.requester}</p>
              <p><span className="font-semibold">Assigned Reviewer:</span> {request.assignedReviewer}</p>
              <p><span className="font-semibold">Priority:</span> {request.priority}</p>
              <p><span className="font-semibold">Risk Level:</span> {request.riskLevel}</p>
              <p><span className="font-semibold">Deadline:</span> {request.deadline}</p>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-slate-900">Uploaded Documents</h4>
              <ul className="mt-2 space-y-2">
                {request.documents.length === 0 ? (
                  <li className="text-sm text-slate-500">No documents uploaded.</li>
                ) : (
                  request.documents.map((documentName) => (
                    <li key={documentName} className="text-sm bg-slate-50 rounded-lg p-3">{documentName}</li>
                  ))
                )}
              </ul>
            </div>
          </div>

          <AiSummaryBox summary={request.aiSummary} />
          <ReviewerComments initialComments={request.reviewerComments} />
        </div>

        <ContractChecklist />
      </div>

      {/* BACKEND TODO: GET /api/requests/:id to fetch real request details. */}
      {/* BACKEND TODO: PATCH /api/requests/:id/status to update request status. */}
      {/* BACKEND TODO: PATCH /api/requests/:id/assign to assign a legal reviewer. */}
    </section>
  );
}

export default RequestDetails;

/*
BEGINNER DOCUMENTATION:

1. What is early return?
If no request is selected, we return a simple message before rendering the full details page.

2. What is component composition?
RequestDetails uses smaller components inside it: AiSummaryBox, ReviewerComments, and ContractChecklist.

3. What is optional frontend behavior?
This page is usable with mock data now. Backend comments show where real API integration can be added later.

4. What is responsive layout?
Tailwind classes like grid-cols-1 and xl:grid-cols-3 change the layout depending on screen size.
*/
