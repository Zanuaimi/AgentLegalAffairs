// This file stores demo data for the frontend prototype.
// Because this task is frontend-only, this data replaces real backend responses for now.

export const roles = [
  "Requester",
  "Legal Reviewer",
  "Legal Manager",
  "Department Approver",
  "Admin User",
];

export const departments = [
  "HR",
  "Procurement",
  "Research Office",
  "Student Affairs",
  "Finance",
  "Legal Affairs",
  "Academic Affairs",
  "IT",
  "Other",
];

export const legalCategories = [
  { code: "LEG-A", name: "Legal Advice / Opinion" },
  { code: "LEG-B", name: "Contract Review" },
  { code: "LEG-C", name: "Research Agreements" },
  { code: "LEG-D", name: "Student Agreements" },
  { code: "LEG-E", name: "Committee / Investigation / Disciplinary Matters" },
  { code: "LEG-F", name: "Administrative Legal Work" },
  { code: "LEG-G", name: "Legal Operations / Reporting" },
];

export const requestStatuses = [
  "New",
  "Under Review",
  "Waiting for More Information",
  "Assigned to Legal Reviewer",
  "Draft Response Prepared",
  "Sent for Internal Approval",
  "Returned for Revision",
  "Approved",
  "Closed",
  "Archived",
];

export const priorityLevels = ["Low", "Medium", "High", "Urgent"];

export const initialUsers = [
  {
    id: "USR-001",
    name: "Aisha Mohamed",
    email: "aisha.mohamed@university.edu",
    role: "Requester",
    department: "Procurement",
    status: "Active",
  },
  {
    id: "USR-002",
    name: "Khalid Ali",
    email: "khalid.ali@university.edu",
    role: "Requester",
    department: "HR",
    status: "Active",
  },
  {
    id: "USR-003",
    name: "Dr. Sara Nasser",
    email: "sara.nasser@university.edu",
    role: "Requester",
    department: "Research Office",
    status: "Active",
  },
  {
    id: "USR-004",
    name: "Omar Hassan",
    email: "omar.hassan@university.edu",
    role: "Legal Reviewer",
    department: "Legal Affairs",
    status: "Active",
  },
  {
    id: "USR-005",
    name: "Fatima Salem",
    email: "fatima.salem@university.edu",
    role: "Legal Manager",
    department: "Legal Affairs",
    status: "Active",
  },
  {
    id: "USR-006",
    name: "Mariam Ahmed",
    email: "mariam.ahmed@university.edu",
    role: "Department Approver",
    department: "Finance",
    status: "Active",
  },
  {
    id: "USR-007",
    name: "Admin User",
    email: "admin@university.edu",
    role: "Admin User",
    department: "IT",
    status: "Active",
  },
];

export const contractChecklistItems = [
  "Parties correctly identified",
  "Scope clearly defined",
  "Payment terms included",
  "Term and termination clauses included",
  "Confidentiality clause included",
  "Data protection clause included, if relevant",
  "Intellectual property clause included, if relevant",
  "Liability and indemnity reviewed",
  "Governing law and jurisdiction reviewed",
  "Signature authority confirmed",
  "Internal approvals obtained",
];

export const initialRequests = [
  {
    id: "LA-2026-001",
    title: "Review vendor service agreement",
    categoryCode: "LEG-B",
    categoryName: "Contract Review",
    department: "Procurement",
    requester: "Aisha Mohamed",
    assignedReviewer: "Omar Hassan",
    priority: "High",
    riskLevel: "Medium",
    status: "Under Review",
    deadline: "2026-07-05",
    description:
      "Procurement needs Legal Affairs to review a service agreement before signature.",
    documents: ["Vendor_Service_Agreement.pdf"],
    aiSummary:
      "AI draft: This appears to be a vendor service agreement. Key review areas include payment terms, termination, liability, confidentiality, and signature authority.",
    reviewerComments: [
      "Please confirm whether Finance has reviewed the payment schedule.",
      "Liability clause needs additional review before approval.",
    ],
  },
  {
    id: "LA-2026-002",
    title: "HR legal opinion on employment policy",
    categoryCode: "LEG-A",
    categoryName: "Legal Advice / Opinion",
    department: "HR",
    requester: "Khalid Ali",
    assignedReviewer: "Fatima Salem",
    priority: "Medium",
    riskLevel: "Low",
    status: "Waiting for More Information",
    deadline: "2026-07-08",
    description:
      "HR is requesting legal clarification about an internal employment policy update.",
    documents: ["HR_Policy_Draft.docx"],
    aiSummary:
      "AI draft: This request asks for legal interpretation of an HR policy. More background information may be needed before final advice is prepared.",
    reviewerComments: [
      "Requester should provide the current approved policy for comparison.",
    ],
  },
  {
    id: "LA-2026-003",
    title: "Research data sharing agreement",
    categoryCode: "LEG-C",
    categoryName: "Research Agreements",
    department: "Research Office",
    requester: "Dr. Sara Nasser",
    assignedReviewer: "Omar Hassan",
    priority: "Urgent",
    riskLevel: "High",
    status: "Assigned to Legal Reviewer",
    deadline: "2026-07-02",
    description:
      "Research Office requires review of a data sharing agreement with an external university partner.",
    documents: ["Research_Data_Sharing_Agreement.pdf"],
    aiSummary:
      "AI draft: This document may involve personal or sensitive research data. Review data usage, confidentiality, publication rights, IP, and liability clauses.",
    reviewerComments: [],
  },
];

export const auditLogs = [
  {
    id: 1,
    requestId: "LA-2026-001",
    action: "Request created",
    user: "Aisha Mohamed",
    time: "2026-06-30 09:15",
  },
  {
    id: 2,
    requestId: "LA-2026-001",
    action: "Document uploaded",
    user: "Aisha Mohamed",
    time: "2026-06-30 09:17",
  },
  {
    id: 3,
    requestId: "LA-2026-001",
    action: "Assigned to Legal Reviewer",
    user: "Legal Manager",
    time: "2026-06-30 10:05",
  },
  {
    id: 4,
    requestId: "LA-2026-002",
    action: "Additional information requested",
    user: "Fatima Salem",
    time: "2026-06-30 11:20",
  },
  {
    id: 5,
    requestId: "LA-2026-003",
    action: "AI draft summary generated",
    user: "AI Assistant",
    time: "2026-06-30 12:10",
  },
];

/*
BEGINNER DOCUMENTATION:

1. What is an array?
An array is a list of values. Example: ['HR', 'Finance', 'IT'].

2. What is an object?
An object stores related information using key-value pairs. Example: { name: 'Aisha', role: 'Requester' }.

3. What is export?
export allows other files to import and use these arrays and objects.

4. Why use mock data?
Mock data is fake data used while the backend is not ready. It helps us build and test the frontend design.

4.1 What are initialUsers?
initialUsers are dummy users shown on the Admin page so admins can test role and department management.

5. What are backend comments for?
In UI files, comments like BACKEND TODO explain where real API calls should be added later by the backend/frontend integration team.
*/
