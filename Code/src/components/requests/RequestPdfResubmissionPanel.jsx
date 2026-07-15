import { useState } from "react";

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

function RequestPdfResubmissionPanel({ onResubmit }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function submitReplacement() {
    if (!file || isSaving) {
      setMessage("Choose a replacement PDF first.");
      return;
    }
    setIsSaving(true);
    setMessage("");
    try {
      await onResubmit(file);
      setFile(null);
      setMessage("New PDF submitted. AI review has been queued again.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit the replacement PDF.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="font-bold text-blue-950">Submit Requested PDF Update</h3>
      <p className="mt-1 text-sm text-blue-800">
        Your reviewer requested more information. Upload a new PDF for this same request; it will be marked as the current PDF and sent for a new AI review.
      </p>
      <input
        className="mt-4 w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => {
          const selected = event.target.files?.[0] || null;
          if (!selected) return setFile(null);
          if (!(selected.type === "application/pdf" || selected.name.toLowerCase().endsWith(".pdf"))) {
            setFile(null);
            setMessage("Please choose a PDF file.");
            return;
          }
          if (selected.size > MAX_PDF_SIZE_BYTES) {
            setFile(null);
            setMessage("Replacement PDFs must be 10 MB or smaller.");
            return;
          }
          setFile(selected);
          setMessage("");
        }}
      />
      {file && <p className="mt-2 text-xs font-semibold text-green-700">New PDF: {file.name}</p>}
      <button
        type="button"
        disabled={!file || isSaving}
        onClick={submitReplacement}
        className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Uploading and queuing..." : "Submit New PDF for AI Review"}
      </button>
      {message && <p className="mt-3 text-sm font-semibold text-blue-800">{message}</p>}
    </section>
  );
}

export default RequestPdfResubmissionPanel;
