import { useMemo, useState } from "react";

function getPriorityStyle(priority) {
  if (priority === "Urgent") return "bg-red-100 text-red-700";
  if (priority === "High") return "bg-orange-100 text-orange-700";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function SortButton({ label, column, sortConfig, onSort }) {
  const isActive = sortConfig.column === column;
  const arrow = sortConfig.direction === "ascending" ? "↑" : "↓";

  return (
    <button
      type="button"
      className="flex items-center gap-1 font-semibold hover:text-blue-700"
      onClick={() => onSort(column)}
    >
      <span>{label}</span>
      {isActive && (
        <span aria-label={`Sorted ${sortConfig.direction}`}>{arrow}</span>
      )}
    </button>
  );
}

function RequestTable({
  requests,
  onSelectRequest,
  canOpenDetails,
  title,
  description,
}) {
  // sortConfig stores the one active table sort: which column and which direction.
  const [sortConfig, setSortConfig] = useState({
    column: "title",
    direction: "ascending",
  });

  const sortedRequests = useMemo(() => {
    const sorted = [...requests];

    sorted.sort((firstRequest, secondRequest) => {
      const firstValue = String(firstRequest[sortConfig.column] || "");
      const secondValue = String(secondRequest[sortConfig.column] || "");

      return firstValue.localeCompare(secondValue, undefined, {
        sensitivity: "base",
      });
    });

    if (sortConfig.direction === "descending") {
      sorted.reverse();
    }

    return sorted;
  }, [requests, sortConfig]);

  function handleSort(column) {
    const isSameColumn = sortConfig.column === column;

    setSortConfig({
      column,
      direction:
        isSameColumn && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <p className="text-slate-500 mt-1">{description}</p>
        <p className="text-xs text-slate-500 mt-2">
          Click table headers to sort. Only one sort is active at a time.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-4">
                  <SortButton
                    label="Request"
                    column="title"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Sent Time"
                    column="submittedAt"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Requester"
                    column="requester"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Request Type"
                    column="categoryName"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Department"
                    column="department"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Priority"
                    column="priority"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Status"
                    column="status"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                <th className="text-left p-4">
                  <SortButton
                    label="Reviewer"
                    column="assignedReviewer"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                </th>
                {canOpenDetails && <th className="text-left p-4">Action</th>}
              </tr>
            </thead>
            <tbody>
              {sortedRequests.map((request) => (
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
                  <td className="p-4 text-slate-700">
                    {request.submittedAt || "Not recorded"}
                  </td>
                  <td className="p-4 text-slate-700">{request.requester}</td>
                  <td className="p-4 text-slate-700">
                    <p>{request.categoryName}</p>
                    <p className="text-xs text-slate-500">
                      {request.categoryCode}
                    </p>
                  </td>
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

5. What is sorting?
Sorting rearranges rows by one column, such as request title, sent time, requester, request type, or department.

6. Why use useMemo?
useMemo recalculates the sorted list only when requests or sortConfig changes, instead of sorting again on every render.
*/
