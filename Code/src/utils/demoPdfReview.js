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

export function createFrontendPdfDocument(file) {
  return {
    name: file.name,
    type: "application/pdf",
    url: URL.createObjectURL(file),
    checklist: createEmptyChecklistForUploadedPdf(),
    aiSuggestions: [
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
    ],
  };
}

/*
BEGINNER DOCUMENTATION:

1. Why is the full checklist generated here?
Every request should show the same full criteria list. AI only decides which criteria start checked.

2. Why is only Document type identified checked for newly uploaded PDFs?
The frontend can know the file is a PDF, but real clause analysis belongs to backend/AI integration later.
*/
