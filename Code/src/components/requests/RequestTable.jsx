function getPriorityStyle(priority) {
  if (priority === "Urgent") return "bg-red-100 text-red-700";
  if (priority === "High") return "bg-orange-100 text-orange-700";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function RequestTable({
  requests,
  onSelectRequest,
  canOpenDetails,
  title,
  description,
}) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 mt-1">{description}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-4">Request</th>
                <th className="text-left p-4">Category</th>
                <th className="text-left p-4">Department</th>
                <th className="text-left p-4">Priority</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Reviewer</th>
                {canOpenDetails && <th className="text-left p-4">Action</th>}
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {request.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {request.id} • Due {request.deadline}
                    </p>
                  </td>
                  <td className="p-4 text-slate-700">{request.categoryCode}</td>
                  <td className="p-4 text-slate-700">{request.department}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityStyle(request.priority)}`}
                    >
                      {request.priority}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">{request.status}</td>
                  <td className="p-4 text-slate-700">
                    {request.assignedReviewer}
                  </td>
                  {canOpenDetails && (
                    <td className="p-4">
                      <button
                        className="text-blue-700 font-semibold hover:underline"
                        type="button"
                        onClick={() => onSelectRequest(request.id)}
                      >
                        View Details
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BACKEND TODO: GET /api/requests to fetch real legal request rows from the backend. */}
    </section>
  );
}

export default RequestTable;

/*
BEGINNER DOCUMENTATION:

1. What is a table?
<table> displays data in rows and columns. It is useful for lists like legal requests.

2. What is a helper function?
getPriorityStyle is a helper function. It keeps styling logic separate from the JSX.

3. What is key?
React uses key to identify each item in a list. The request ID is a good unique key.

4. What is canOpenDetails?
canOpenDetails is a boolean prop. If true, the table shows the View Details action. If false, requesters only see status information.

5. Why did we add text-slate-700 to table cells?
It makes the text color explicit, so dark mode CSS can turn it into a readable light color.
*/
