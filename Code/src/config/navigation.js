export const navigationByRole = {
  Requester: [
    { id: "new-request", label: "Send Request" },
    { id: "requests", label: "My Requests" },
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
    { id: "legal-engine", label: "Legal Affair Engine" },
    { id: "audit", label: "Audit Log" },
  ],
  "Legal Reviewer": [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Legal Requests" },
    { id: "details", label: "Request Details" },
  ],
  "Legal Manager": [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Legal Requests" },
    { id: "manager-review-queue", label: "My Review Queue" },
    { id: "reviewers", label: "Legal Reviewers" },
    { id: "details", label: "Request Details" },
  ],
  "Department Approver": [
    { id: "dashboard", label: "Dashboard" },
    { id: "requests", label: "Department Legal Requests" },
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
