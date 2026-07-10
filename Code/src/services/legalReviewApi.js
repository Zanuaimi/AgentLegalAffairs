import { supabase } from "./supabaseClient";

async function getFunctionAuthToken() {
  const { data } = supabase ? await supabase.auth.getSession() : { data: null };
  return data?.session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY;
}

export async function triggerAiReviewQueue() {
  const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const authToken = await getFunctionAuthToken();

  if (!functionsUrl) {
    throw new Error(
      "Supabase Functions URL is missing. Set VITE_SUPABASE_FUNCTIONS_URL to process AI review jobs.",
    );
  }

  const response = await fetch(`${functionsUrl}/legal-review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
    body: JSON.stringify({ action: "process-next" }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "AI legal review queue processing failed.");
  }

  return result;
}

/*
BEGINNER DOCUMENTATION:

1. Why does the browser only trigger the queue?
The request and PDF are saved first. The Edge Function then loads the exact queued request/document from Supabase, which prevents mixing one user's PDF with another user's request.

2. Why not send Gemini the file directly from React?
React code runs in the browser. The Gemini key and queue processing must stay in backend code.

3. Why does this endpoint process one job at a time?
A database queue lets the backend claim the oldest pending request safely. If the server restarts, pending jobs remain in PostgreSQL and can be processed later.
*/
