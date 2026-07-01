export function getVisibleRequests({
  requests,
  role,
  currentUser,
  department,
}) {
  if (role === "Requester") {
    return requests.filter(
      (request) => request.requesterUsername === currentUser.username,
    );
  }

  if (role === "Department Approver") {
    return requests.filter((request) => request.department === department);
  }

  return requests;
}

export function getSelectedVisibleRequest({ requests, selectedRequestId }) {
  return requests.find((request) => request.id === selectedRequestId);
}

/*
BEGINNER DOCUMENTATION:

1. Why filter by username instead of full name?
A username is more stable than a full name. Two people can share the same full name, but usernames should be unique.

2. Why filter Department Approver by department?
The PDF says Department Approvers review department-specific content, so this frontend demo only shows requests from the selected department.

3. Why make this a helper?
It keeps filtering logic outside App.jsx, so App.jsx is easier to read.
*/
