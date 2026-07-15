export const navigationByRole = {
  Requester: [
    { id: "new-request", label: "Send Request" },
    { id: "requests", label: "My Current Requests" },
    { id: "closed-requests", label: "My Closed Requests" },
    { id: "details", label: "Request Details" },
  ],
  "Admin User": [
    { id: "admin", label: "Admin" },
    { id: "legal-engine", label: "Legal Affair Engine" },
    { id: "audit", label: "Audit Log" },
  ],
  Owner: [
    { id: "dashboard", label: "Dashboard" },
    { id: "new-request", label: "Send Request" },
    { id: "requests", label: "Legal Requests" },
    { id: "reviewers", label: "Legal Reviewers" },
    { id: "details", label: "Request Details" },
    { id: "admin", label: "Admin" },
    { id: "owner-controls", label: "Owner" },
    { id: "legal-engine", label: "Legal Affair Engine" },
    { id: "audit", label: "Audit Log" },
  ],
  "Legal Reviewer": [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Global Requests" },
    { id: "reviewer-review-queue", label: "Requests Assigned to You" },
    { id: "details", label: "Request Details" },
  ],
  "Legal Manager": [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Global Requests" },
    { id: "manager-review-queue", label: "Requests Assigned to You" },
    { id: "reviewers", label: "Legal Reviewers" },
    { id: "details", label: "Request Details" },
  ],
  "Department Approver": [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Global Requests" },
    { id: "department-review-queue", label: "Requests Assigned to You" }, 
    { id: "details", label: "Request Details" },
  ],
};

/*
BEGINNER DOCUMENTATION:

1. Why move navigation here?
App.jsx was becoming crowded. This file keeps role navigation rules in one easy place.

2. What is an object used as a map?
Each role name is a key. The value is the list of sidebar tabs that role can see.
*/
