// Supabase Edge Function: legal-review
//
// Purpose:
// This is the backend AI review endpoint for the Legal Affairs platform.
// The React frontend sends a PDF/DOCX/TXT file as base64. This function keeps
// the Gemini API key safely on the server side, asks Gemini for structured legal
// review support, and returns JSON to the frontend.
//
// Local/Supabase secrets needed for real AI mode:
//   GEMINI_API_KEY=your_google_gemini_key
// Optional:
//   USE_MOCK_AI_REVIEW=true  -> forces mock result for demos
//
// IMPORTANT LEGAL RULE:
// AI output is draft support only. Legal Affairs must review and approve.

// This small declaration keeps regular TypeScript editors happy even when the
// Deno language server is not enabled. Supabase Edge Functions still run on Deno.
declare const Deno: {
  serve: (
    handler: (request: Request) => Response | Promise<Response>,
  ) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const approvedTemplates = [
  {
    template_name: "Standard NDA Template v3.2",
    category: "NDA",
    required_clauses: [
      "Definition of Confidential Information",
      "Term and Termination",
      "Permitted Disclosures",
      "Return/Destruction of Materials",
      "Governing Law (state university jurisdiction)",
      "No License Granted",
    ],
  },
  {
    template_name: "Vendor Services Agreement Template v2.1",
    category: "Vendor Agreement",
    required_clauses: [
      "Scope of Services",
      "Payment Terms",
      "Indemnification",
      "Insurance Requirements",
      "Termination for Convenience",
      "Data Security / FERPA Compliance",
      "Limitation of Liability",
    ],
  },
  {
    template_name: "Research Collaboration Agreement Template v1.4",
    category: "Research Collaboration Agreement",
    required_clauses: [
      "IP Ownership and Background IP",
      "Publication Rights",
      "Data Sharing and Retention",
      "Export Control Compliance",
      "Liability Allocation",
    ],
  },
];

const precedentCorpus = [
  {
    source_id: "PRECEDENT-0012",
    title: "NDA with Acme Research Partners (2024)",
    document_type: "NDA",
    summary:
      "Mutual NDA flagged for one-sided indemnification, revised to mutual before signature.",
  },
  {
    source_id: "PRECEDENT-0027",
    title: "Vendor Agreement with CloudSoft Inc. (2023)",
    document_type: "Vendor Agreement",
    summary:
      "SaaS vendor agreement; required FERPA data processing addendum and breach notification clause.",
  },
  {
    source_id: "PRECEDENT-0041",
    title: "Research Collaboration with State Polytechnic (2024)",
    document_type: "Research Collaboration Agreement",
    summary:
      "Joint grant-funded research agreement; publication delay rights resolved at 45 days.",
  },
  {
    source_id: "PRECEDENT-0053",
    title: "Data Sharing Agreement with HealthAnalytics Co. (2025)",
    document_type: "Data Sharing Agreement",
    summary:
      "De-identified dataset sharing; required HIPAA limited data set language.",
  },
];

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function buildMockResult(filename: string) {
  return {
    request_category: "Vendor Agreement",
    category_confidence: 0.86,
    extracted_clauses: [
      {
        clause_title: "Scope of Services",
        clause_text:
          "Vendor will provide cloud-based analytics services as described in Exhibit A.",
        location_hint: "Section 1",
      },
      {
        clause_title: "Payment Terms",
        clause_text:
          "University agrees to pay $54,000 annually, net 30 days from invoice.",
        location_hint: "Section 3",
      },
      {
        clause_title: "Auto-Renewal",
        clause_text:
          "Agreement renews automatically unless cancelled 90 days before term end.",
        location_hint: "Section 2",
      },
      {
        clause_title: "Limitation of Liability",
        clause_text:
          "Vendor liability capped at total fees paid in preceding 12 months.",
        location_hint: "Section 6",
      },
    ],
    missing_or_unusual_clauses: [
      {
        clause_title: "Data Security / FERPA Compliance",
        issue_type: "missing",
        explanation:
          "No data protection or FERPA language found despite vendor handling student data.",
      },
      {
        clause_title: "Insurance Requirements",
        issue_type: "missing",
        explanation:
          "Standard template requires vendor to carry specified insurance coverage.",
      },
      {
        clause_title: "Governing Law",
        issue_type: "unusual",
        explanation:
          "Agreement specifies Delaware law rather than the university home state.",
      },
    ],
    template_comparisons: [
      {
        template_name: "Vendor Services Agreement Template v2.1",
        match_score: 0.65,
        deviations: [
          "Missing FERPA Compliance clause",
          "Missing Insurance Requirements",
          "Governing law is Delaware, not university home state",
          "Liability cap below standard minimum",
        ],
      },
    ],
    risk_highlights: [
      {
        term: "Limitation of Liability",
        risk_level: "high",
        reason:
          "Cap of $54,000 is insufficient to cover damages from a student data breach.",
        clause_text:
          "Vendor liability shall not exceed fees paid in the preceding 12 months.",
      },
      {
        term: "Auto-Renewal (90-day notice)",
        risk_level: "medium",
        reason:
          "90-day cancellation window is longer than the university standard of 30 days.",
      },
      {
        term: "One-sided Indemnification",
        risk_level: "medium",
        reason:
          "University bears broad indemnification; vendor obligations to university are narrow.",
      },
    ],
    obligations_summary: [
      "Pay $54,000 annually within 30 days of invoice.",
      "Provide system access needed for vendor to deliver services.",
      "Ensure users comply with vendor acceptable use policy.",
      "Bear broad indemnification obligations toward the vendor.",
      "Cannot terminate during the initial 12-month term for convenience.",
    ],
    draft_review_note:
      `DRAFT REVIEW NOTE — ${filename}\n\n` +
      "This Vendor Services Agreement has been reviewed against the university standard template. Several issues require attention before signature:\n\n" +
      "1. No FERPA / data security clause despite vendor handling student data.\n" +
      "2. Liability cap is below university standard minimum.\n" +
      "3. Auto-renewal notice period exceeds university standard.\n" +
      "4. Indemnification clause is significantly one-sided.\n" +
      "5. Governing law may create jurisdictional complications.\n\n" +
      "This is a first-draft note for Legal Affairs review. It does not constitute final approval.",
    suggested_questions: [
      "Can the vendor add a FERPA-compliant data processing addendum?",
      "Can the liability cap be increased to the university standard minimum?",
      "Can the auto-renewal notice period be reduced from 90 to 30 days?",
      "Is the vendor willing to include a mutual indemnification clause?",
      "Can governing law be changed to the university home state?",
    ],
    related_precedents: [
      {
        title: "Vendor Agreement with CloudSoft Inc. (2023)",
        document_type: "Vendor Agreement",
        summary:
          "SaaS vendor agreement; required FERPA data processing addendum and breach notification clause.",
        similarity_score: 0.87,
        source_id: "PRECEDENT-0027",
      },
    ],
    disclaimer:
      "This output was generated by an AI assistant and does not constitute a final legal decision. All outputs must be reviewed and approved by Legal Affairs.",
    ai_mode: "mock",
  };
}

function extractJsonFromGeminiText(text: string) {
  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch (_error) {
    const firstBrace = trimmed.indexOf("{");
    const lastBrace = trimmed.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Gemini did not return JSON.");
    }

    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await request.json();
    const fileName = body.fileName || "uploaded-document";
    const mimeType = body.mimeType || "application/pdf";
    const fileBase64 = body.fileBase64;

    if (!fileBase64) {
      return jsonResponse({ error: "fileBase64 is required" }, 400);
    }

    const forceMock = Deno.env.get("USE_MOCK_AI_REVIEW") === "true";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (forceMock) {
      return jsonResponse(buildMockResult(fileName));
    }

    if (!geminiApiKey) {
      return jsonResponse(
        {
          error: "GEMINI_API_KEY is not configured for the legal-review Edge Function.",
        },
        500,
      );
    }

    const prompt = `You are the AI-Assisted Legal Review Engine for a university Legal Affairs team.
Analyze the submitted document and return ONLY valid JSON with this structure:
{
  "request_category": "NDA | Vendor Agreement | Research Collaboration Agreement | Memorandum of Understanding | Employment Contract | Data Sharing Agreement | Licensing Agreement | Lease Agreement | Grant Agreement | Other",
  "category_confidence": 0.0,
  "extracted_clauses": [{"clause_title":"", "clause_text":"", "location_hint":""}],
  "missing_or_unusual_clauses": [{"clause_title":"", "issue_type":"missing | unusual", "explanation":""}],
  "template_comparisons": [{"template_name":"", "match_score":0.0, "deviations":[""]}],
  "risk_highlights": [{"term":"", "risk_level":"low | medium | high", "reason":"", "clause_text":"", "page":"1"}],
  "review_checklist": [{"criteria":"", "checked":true, "page":"1", "note":""}],
  "obligations_summary": [""],
  "draft_review_note": "",
  "suggested_questions": [""],
  "related_precedents": [{"title":"", "document_type":"", "summary":"", "similarity_score":0.0, "source_id":""}],
  "disclaimer": "This output was generated by an AI assistant and does not constitute a final legal decision. All outputs must be reviewed and approved by Legal Affairs."
}

Cover:
1. Request category
2. Key clauses extracted
3. Missing or unusual clauses compared to standard templates
4. Template comparison
5. Risk terms and reasons
6. University obligations summary
7. First-draft review note
8. Clarifying questions
9. Relevant precedents using exact source_id when applicable
10. A review_checklist item for EVERY criterion listed below, with checked true/false, page number or "N/A", and short note

Checklist criteria to use exactly:
${JSON.stringify([
  "Document type identified",
  "Parties correctly identified",
  "Request category matches the document",
  "Request description matches the attached document",
  "Effective date identified",
  "Expiry date or end date identified",
  "Scope clearly defined",
  "Key obligations summarized",
  "Payment terms included, if relevant",
  "Funding terms included, if relevant",
  "Term and termination clauses included",
  "Confidentiality clause included",
  "Data protection clause included, if relevant",
  "Intellectual property clause included, if relevant",
  "Publication rights reviewed, if relevant",
  "Liability and indemnity reviewed",
  "Insurance requirements reviewed, if relevant",
  "Governing law and jurisdiction reviewed",
  "Signature authority confirmed",
  "Internal approvals obtained or identified",
  "Missing clauses or missing information identified",
  "Unusual or high-risk terms highlighted",
  "Compared against university-approved template or standard position",
  "Similar past legal opinion or reviewed agreement considered",
  "Reviewer questions for requester identified",
  "Final approved response/document storage needed",
], null, 2)}

Rules:
- Do not make final legal decisions.
- Do not say approved/final.
- Return JSON only.
- If a checklist item is not found, set checked false, page "N/A", and explain what Legal Affairs should review manually.

TEMPLATES:
${JSON.stringify(approvedTemplates, null, 2)}

PRECEDENTS:
${JSON.stringify(precedentCorpus, null, 2)}

Document filename: ${fileName}`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: fileBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      return jsonResponse(
        {
          error: "Gemini review failed",
          details: errorText,
        },
        502,
      );
    }

    const geminiJson = await geminiResponse.json();
    const responseText =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const result = extractJsonFromGeminiText(responseText);

    return jsonResponse({
      ...result,
      ai_mode: "gemini",
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Legal review function failed",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
