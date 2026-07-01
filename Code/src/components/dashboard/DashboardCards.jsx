import InfoButton from "../common/InfoButton";

function DashboardCards({ requests }) {
  // These calculated values make the dashboard update when the request list changes.
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) => request.status !== "Closed" && request.status !== "Archived",
  ).length;
  const underReview = requests.filter(
    (request) => request.status === "Under Review",
  ).length;
  const highRisk = requests.filter(
    (request) => request.riskLevel === "High",
  ).length;

  const cards = [
    {
      label: "Total Requests",
      value: totalRequests,
      color: "bg-blue-600",
      info: "All legal requests currently stored in this frontend demo list.",
    },
    {
      label: "Pending Items",
      value: pendingRequests,
      color: "bg-amber-500",
      info: "Requests that are not Closed or Archived yet.",
    },
    {
      label: "Under Review",
      value: underReview,
      color: "bg-purple-600",
      info: "Requests whose current status is Under Review.",
    },
    {
      label: "High Risk",
      value: highRisk,
      color: "bg-rose-600",
      info: "Requests marked with High risk level in the mock data.",
    },
  ];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Overview of Legal Affairs workload for Version 1.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5"
          >
            <div className={`w-12 h-12 ${card.color} rounded-xl mb-4`} />
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">{card.label}</p>
              <InfoButton
                label={`${card.label} information`}
                description={card.info}
              />
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900 mb-3">Version 1 Focus</h3>
        <p className="text-slate-600">
          This dashboard uses mock frontend data. Later, the backend can provide
          live request counts, overdue requests, turnaround time, and
          department-based reports.
        </p>
        {/* BACKEND TODO: GET /api/dashboard/summary to fetch live dashboard statistics. */}
      </div>
    </section>
  );
}

export default DashboardCards;

/*
BEGINNER DOCUMENTATION:

1. What is filter?
filter creates a new array containing only items that match a condition.

2. What is derived data?
Derived data is calculated from existing data. Example: pendingRequests is calculated from requests.

3. Why use cards?
Cards visually group important numbers so users can scan the dashboard quickly.

4. What is a section tag?
<section> groups related content on a page.
*/
