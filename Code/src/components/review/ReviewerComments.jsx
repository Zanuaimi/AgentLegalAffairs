import { useEffect, useState } from "react";

function ReviewerComments({
  initialComments,
  canManageReview,
  reviewerName = "Legal Reviewer",
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  function addComment() {
    if (!canManageReview) return;
    if (!newComment.trim()) return;

    // BACKEND TODO: POST /api/requests/:id/comments
    // Save the reviewer comment for the selected request in the backend.

    setComments([
      ...comments,
      {
        reviewerName,
        text: newComment,
      },
    ]);
    setNewComment("");
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Reviewer Comments</h3>
      <p className="text-sm text-slate-500 mt-1">
        Legal Affairs reviewers can record observations and required changes.
      </p>

      {!canManageReview && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          View-only: reviewer comments are visible for status tracking, but only
          the Legal Reviewer can add reviewer comments.
        </div>
      )}

      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No reviewer comments yet.</p>
        ) : (
          comments.map((comment, index) => {
            // Older demo comments may be plain strings. Newer comments are objects
            // with reviewerName and text, so the UI can show who wrote the comment.
            const commentText =
              typeof comment === "string" ? comment : comment.text;
            const commentReviewer =
              typeof comment === "string"
                ? reviewerName
                : comment.reviewerName || reviewerName;

            return (
              <div
                key={`${commentText}-${index}`}
                className="bg-slate-50 rounded-xl p-3 text-slate-700"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  {commentReviewer}
                </p>
                <p className="mt-1">{commentText}</p>
              </div>
            );
          })
        )}
      </div>

      {canManageReview && (
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder={`Add a frontend demo comment as ${reviewerName}`}
          />
          <button
            className="bg-slate-900 text-white rounded-lg px-5 py-3 font-semibold"
            type="button"
            onClick={addComment}
          >
            Add Comment
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewerComments;

/*
BEGINNER DOCUMENTATION:

1. Why import useEffect?
useEffect updates the visible comments when the user opens a different request.

2. What is trim?
trim removes extra spaces from the beginning and end of a string.

3. What is conditional rendering?
The component shows different JSX depending on comments.length and canManageReview.

4. Why can some roles see comments but not add them?
Requesters, Legal Managers, and Department Approvers need review status visibility, but Legal Reviewer controls official reviewer notes.
*/
