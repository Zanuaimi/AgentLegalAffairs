import { legalReviewCriteria } from "../data/mockData";

export function createEmptyChecklistForUploadedPdf() {
  return legalReviewCriteria.map((criteria) => ({
    criteria,
    page: criteria === "Document type identified" ? 1 : "N/A",
    checked: criteria === "Document type identified",
    note:
      criteria === "Document type identified"
        ? "Frontend demo identifies the uploaded file as a PDF document. Legal Affairs should complete the remaining review criteria."
        : "AI has not confirmed this criterion for the newly uploaded PDF. Legal Affairs should review it manually.",
  }));
}

function buildAiSuggestionsFromReview(aiReviewResult) {
  if (!aiReviewResult) {
    return [
      {
        page: 1,
        type: "Frontend Demo",
        text: "AI draft placeholder: The uploaded PDF was accepted. Legal Affairs should review the full criteria checklist manually.",
      },
      {
        page: 1,
        type: "Human Review Required",
        text: "AI draft placeholder: This suggestion is not a final legal decision. Legal Affairs must review the PDF manually.",
      },
    ];
  }

  const riskSuggestions = (aiReviewResult.risk_highlights || []).map(
    (risk, index) => ({
      page: risk.page || index + 1,
      type: `Risk: ${risk.risk_level}`,
      text: `${risk.term}: ${risk.reason}`,
    }),
  );

  const clauseSuggestions = (
    aiReviewResult.missing_or_unusual_clauses || []
  ).map((clause, index) => ({
    page: clause.page || index + 1,
    type: `${clause.issue_type} clause`,
    text: `${clause.clause_title}: ${clause.explanation}`,
  }));

  return [
    ...riskSuggestions,
    ...clauseSuggestions,
    {
      page: 1,
      type: "Human Review Required",
      text: aiReviewResult.disclaimer,
    },
  ];
}

function buildChecklistFromReview(aiReviewResult) {
  const aiChecklist = aiReviewResult?.review_checklist || [];

  if (aiChecklist.length > 0) {
    return legalReviewCriteria.map((criteria) => {
      const aiItem = aiChecklist.find(
        (item) => item.criteria?.toLowerCase() === criteria.toLowerCase(),
      );

      return {
        criteria,
        page: aiItem?.page || "N/A",
        checked: Boolean(aiItem?.checked),
        note:
          aiItem?.note ||
          "Gemini did not clearly confirm this checklist item. Legal Reviewer should review manually.",
      };
    });
  }

  return legalReviewCriteria.map((criteria) => ({
    criteria,
    page: criteria === "Document type identified" ? 1 : "N/A",
    checked: criteria === "Document type identified",
    note:
      criteria === "Document type identified"
        ? "AI draft identifies the uploaded file as a document. Legal Reviewer must confirm manually."
        : "AI did not clearly confirm this item. Legal Reviewer should review manually.",
  }));
}

export function createFrontendPdfDocument(file, aiReviewResult = null) {
  return {
    name: file.name,
    type: "application/pdf",
    url: URL.createObjectURL(file),
    checklist: aiReviewResult
      ? buildChecklistFromReview(aiReviewResult)
      : createEmptyChecklistForUploadedPdf(),
    aiSuggestions: buildAiSuggestionsFromReview(aiReviewResult),
  };
}

/*
BEGINNER DOCUMENTATION:

1. Why is the full checklist generated here?
Every request should show the same full criteria list. AI only decides which criteria start checked.

2. Why is only Document type identified checked for newly uploaded PDFs?
The frontend can know the file is a PDF, but real clause analysis belongs to backend/AI integration later.
*/
