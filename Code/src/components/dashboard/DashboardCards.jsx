import InfoButton from "../common/InfoButton";

function DashboardCards({ requests, onSelectFilter }) {
  // These calculated values make the dashboard update when the request list changes.
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(
    (request) =>
      !["Closed", "Archived", "Approved"].includes(request.status),
  ).length;
  const underReview = requests.filter(
    (request) =>
      ![
        "Closed",
        "Archived",
        "Approved",
        "Waiting for More Information",
      ].includes(request.status),
  ).length;
  const highRisk = requests.filter(
    (request) => request.riskLevel === "High",
  ).length;

  const cards = [
    {
      label: "Total Requests",
      value: totalRequests,
      color: "bg-blue-600",
      info: "All legal requests loaded from the backend for the current session.",
      filter: "all",
    },
    {
      label: "Pending Items",
      value: pendingRequests,
      color: "bg-amber-500",
      info: "Requests that are not Closed, Archived, or Approved yet.",
      filter: "pending",
    },
    {
      label: "Under Review",
      value: underReview,
      color: "bg-purple-600",
      info: "Active AI, reviewer, Legal Manager, and Department Approver review work.",
      filter: "under-review",
    },
    {
      label: "High Risk",
      value: highRisk,
      color: "bg-rose-600",
      info: "Requests marked with High risk level by the request or AI review workflow.",
      filter: "high-risk",
    },
  ];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500 mt-1">
          Overview of Legal Affairs workload.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onSelectFilter(card.filter)}
            className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
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
          </button>
        ))}
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
