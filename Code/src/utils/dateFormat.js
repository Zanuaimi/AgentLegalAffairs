function padTwoDigits(value) {
  return String(value).padStart(2, "0");
}

export function formatDateTimeForAudit(date) {
  const year = date.getFullYear();
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());
  const hours = padTwoDigits(date.getHours());
  const minutes = padTwoDigits(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/*
BEGINNER DOCUMENTATION:

1. Why format dates ourselves?
Browser date formatting can look different depending on the user's computer. This helper keeps audit log times consistent.

2. What does padStart do?
padStart adds characters at the beginning of text. Here it turns 7 into 07 for dates and times.
*/
