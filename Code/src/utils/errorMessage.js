function isEmptyObjectMessage(message) {
  return !message || message.trim() === "{}" || message.trim() === "[object Object]";
}

export function getReadableErrorMessage(error, fallbackMessage) {
  console.error("Full error object:", error);

  if (!error) return fallbackMessage;

  if (error instanceof Error) {
    return isEmptyObjectMessage(error.message) ? fallbackMessage : error.message;
  }

  if (typeof error === "string") {
    return isEmptyObjectMessage(error) ? fallbackMessage : error;
  }

  const directMessage =
    error.message ||
    error.error_description ||
    error.error ||
    error.details ||
    error.hint;

  if (typeof directMessage === "string" && !isEmptyObjectMessage(directMessage)) {
    return directMessage;
  }

  const propertyNames = Object.getOwnPropertyNames(error);
  const propertySummary = propertyNames
    .map((propertyName) => `${propertyName}: ${String(error[propertyName])}`)
    .join(" | ");

  if (propertySummary) return propertySummary;

  try {
    const json = JSON.stringify(error);

    if (json && json !== "{}") return json;
  } catch (_jsonError) {
    // Ignore JSON formatting failures and use the fallback below.
  }

  return fallbackMessage;
}

/*
BEGINNER DOCUMENTATION:

1. Why have an error formatter?
Different libraries return different error shapes. Some errors do not show useful text with String(error), so this helper checks multiple common fields.

2. Why console.error?
The visible UI should stay simple, but the browser console can show the full technical error for debugging.
*/
