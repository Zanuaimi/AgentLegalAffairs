import { useState } from "react";
import {
  departments,
  legalCategories,
  priorityLevels,
} from "../../data/mockData";
import { createFrontendPdfDocument } from "../../utils/demoPdfReview";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

function RequestForm({ onCreateRequest, currentUser }) {
  const [formData, setFormData] = useState({
    title: "",
    department: currentUser?.department || "HR",
    categoryCode: "LEG-A",
    priority: "Medium",
    deadline: "",
    description: "",
  });

  // selectedPdfFile stores the actual browser file only while the frontend demo is open.
  const [selectedPdfFile, setSelectedPdfFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  function updateField(fieldName, value) {
    setFormData({ ...formData, [fieldName]: value });
  }

  function handlePdfChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setSelectedPdfFile(null);
      setFileError("");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");

    if (!isPdf) {
      setSelectedPdfFile(null);
      setFileError("Please attach a PDF file only for Version 1.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      setSelectedPdfFile(null);
      setFileError("For security, PDF attachments must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedPdfFile(file);
    setFileError("");
  }

  function getHighestRiskLevel(aiReviewResult) {
    const risks = aiReviewResult?.risk_highlights || [];

    if (risks.some((risk) => risk.risk_level === "high")) return "High";
    if (risks.some((risk) => risk.risk_level === "medium")) return "Medium";
    if (risks.some((risk) => risk.risk_level === "low")) return "Low";
    return "Not Classified";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedPdfFile) {
      setFileError("Please attach one PDF file before submitting the request.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError("");
    setAiStatusMessage(
      "Submitting request. AI review will run from the backend queue after upload.",
    );

    const selectedCategory = legalCategories.find(
      (category) => category.code === formData.categoryCode,
    );

    const submittedAt = new Date().toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const newRequest = {
      id: `LA-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title: formData.title || "Untitled Legal Request",
      categoryCode: formData.categoryCode,
      categoryName: selectedCategory.name,
      department: formData.department,
      requester: currentUser?.name || "Demo Requester",
      requesterUsername: currentUser?.username || "demo.requester",
      assignedReviewer: "Not Assigned",
      priority: formData.priority,
      riskLevel: getHighestRiskLevel(null),
      status: "AI Review Pending",
      deadline: formData.deadline || "No deadline selected",
      submittedAt,
      description:
        formData.description || "No description was provided by the requester.",
      documents: [createFrontendPdfDocument(selectedPdfFile, null)],
      uploadFile: selectedPdfFile,
      aiSummary:
        "AI legal review is pending. The backend queue will process this PDF and update the checklist when the AI draft is ready.",
      aiReviewResult: null,
      reviewerComments: [],
    };

    try {
      await onCreateRequest(newRequest);

      setFormData({
        title: "",
        department: currentUser?.department || "HR",
        categoryCode: "LEG-A",
        priority: "Medium",
        deadline: "",
        description: "",
      });
      setSelectedPdfFile(null);
      setFileError("");
      setAiStatusMessage("");
      event.target.reset();
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Could not submit the request. Your form data has been kept.",
      );
      setAiStatusMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">New Legal Request</h2>
        <p className="text-slate-500 mt-1">
          Submit request details, category, priority, deadline, description, and
          one PDF attachment up to 10 MB.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Request Title
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            value={formData.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Example: Review vendor agreement"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Department
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            value={formData.department}
            onChange={(event) => updateField("department", event.target.value)}
          >
            {departments.map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Legal Category
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            value={formData.categoryCode}
            onChange={(event) =>
              updateField("categoryCode", event.target.value)
            }
          >
            {legalCategories.map((category) => (
              <option key={category.code} value={category.code}>
                {category.code} - {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            value={formData.priority}
            onChange={(event) => updateField("priority", event.target.value)}
          >
            {priorityLevels.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Deadline
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="date"
            value={formData.deadline}
            onChange={(event) => updateField("deadline", event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            PDF Attachment
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-4 py-3"
            type="file"
            accept="application/pdf,.pdf"
            onChange={handlePdfChange}
          />
          <p className="text-xs text-slate-500 mt-1">
            Version 1 accepts PDF files only. The file is analyzed through the
            Supabase legal-review Edge Function when configured.
          </p>
          {selectedPdfFile && (
            <p className="text-xs font-semibold text-green-700 mt-1">
              Selected PDF: {selectedPdfFile.name}
            </p>
          )}
          {fileError && (
            <p className="text-xs font-semibold text-red-700 mt-1">
              {fileError}
            </p>
          )}
          {aiStatusMessage && (
            <p className="text-xs font-semibold text-blue-700 mt-1">
              {aiStatusMessage}
            </p>
          )}
          {submissionError && (
            <p className="text-xs font-semibold text-red-700 mt-1">
              {submissionError}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Request Description
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 px-4 py-3 min-h-40"
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Describe what Legal Affairs should review, why it is needed, and any deadline or context the reviewer should know."
          />
          <p className="text-xs text-slate-500 mt-1">
            This text helps Legal Affairs understand the request before opening
            the PDF.
          </p>
        </div>

        <div className="md:col-span-2">
          <button
            className="bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Analyzing and Submitting..."
              : "Submit Request with AI Review"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default RequestForm;

/*
BEGINNER DOCUMENTATION:

1. What is a form?
A form collects information from the user. Inputs, selects, textareas, and buttons are common form elements.

2. What is controlled input?
A controlled input gets its value from React state and updates state when the user types.

3. What is type="file"?
It lets the user choose a file from their computer. In this demo, we only allow PDF files.

4. What is accept="application/pdf,.pdf"?
accept tells the browser that the file picker should only allow PDF files. We still check the file in JavaScript too.

5. How is the PDF uploaded?
App.jsx sends this selected PDF to the Supabase-backed request service, which stores the file in Supabase Storage.

6. What is URL.createObjectURL?
It creates a temporary browser link for a selected file, so the PDF popup can preview it before the uploaded file is loaded again from Supabase Storage.

7. Why keep the form data after an error?
Uploads and database saves can fail because of a network or permission problem. The form only clears after App.jsx confirms the request was saved, so the requester does not need to select the PDF and type the details again.
*/
