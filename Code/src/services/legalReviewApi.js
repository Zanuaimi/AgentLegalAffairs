import { supabase } from "./supabaseClient";

function describeError(value) {
  if (!value) return "Unknown error";
  if (typeof value === "string") {
    return value === "[object Object]" ? "Unknown object error" : value;
  }
  if (value instanceof Error && value.message !== "[object Object]") {
    return value.message;
  }

  if (typeof value === "object") {
    const candidates = [
      value.message,
      value.error,
      value.msg,
      value.details,
      value.hint,
      value.statusText,
    ].filter(Boolean);

    if (candidates.length > 0) {
      return candidates.map(describeError).join(" | ");
    }

    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(value);
    }
  }

  return String(value);
}

async function describeFunctionInvokeError(error) {
  const response = error?.context;

  if (response && typeof response.text === "function") {
    try {
      const text = await response.text();
      if (!text) return describeError(error);

      try {
        const json = JSON.parse(text);
        return describeError(json.error || json.details || json);
      } catch (_jsonError) {
        return text;
      }
    } catch (_readError) {
      return describeError(error);
    }
  }

  return describeError(error);
}

async function fallbackFetchTrigger() {
  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!functionsUrl) {
    throw new Error(
      "Supabase Functions URL is missing. Set VITE_SUPABASE_FUNCTIONS_URL to process AI review jobs.",
    );
  }

  const { data } = supabase ? await supabase.auth.getSession() : { data: null };
  const authToken = data?.session?.access_token || anonKey;

  const response = await fetch(`${functionsUrl}/legal-review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ action: "process-next" }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      describeError(result.error || result.details || result) ||
        "AI legal review queue processing failed.",
    );
  }

  return result;
}

export async function triggerAiReviewQueue() {
  if (!supabase) return fallbackFetchTrigger();

  const { data, error } = await supabase.functions.invoke("legal-review", {
    body: { action: "process-next" },
  });

  if (error) {
    throw new Error(await describeFunctionInvokeError(error));
  }

  if (data?.error || data?.details) {
    throw new Error(describeError(data.error || data.details));
  }

  return data;
}

/*
BEGINNER DOCUMENTATION:

1. Why use supabase.functions.invoke?
The Supabase client automatically sends the right local/hosted function URL and authenticated headers. This avoids local Edge Function errors like "Auth header is not Bearer token".

2. Why does this file format errors carefully?
Supabase and Edge Functions sometimes return error objects. If React prints an object directly, users see unhelpful text like [object Object]. This helper turns those objects into readable messages.

3. Why does the browser only trigger the queue?
The request and PDF are saved first. The Edge Function then loads the exact queued request/document from Supabase, which prevents mixing one user's PDF with another user's request.
*/
