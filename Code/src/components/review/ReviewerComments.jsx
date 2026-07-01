import { useState } from 'react';

function ReviewerComments({ initialComments }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');

  function addComment() {
    if (!newComment.trim()) return;

    // BACKEND TODO: POST /api/requests/:id/comments
    // Save the reviewer comment for the selected request in the backend.

    setComments([...comments, newComment]);
    setNewComment('');
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <h3 className="font-bold text-slate-900">Reviewer Comments</h3>
      <p className="text-sm text-slate-500 mt-1">Legal Affairs reviewers can record observations and required changes.</p>

      <div className="mt-4 space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500">No reviewer comments yet.</p>
        ) : (
          comments.map((comment, index) => (
            <div key={`${comment}-${index}`} className="bg-slate-50 rounded-xl p-3 text-slate-700">
              {comment}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Add a frontend demo comment"
        />
        <button className="bg-slate-900 text-white rounded-lg px-5 py-3 font-semibold" type="button" onClick={addComment}>
          Add Comment
        </button>
      </div>
    </div>
  );
}

export default ReviewerComments;

/*
BEGINNER DOCUMENTATION:

1. What is trim?
trim removes extra spaces from the beginning and end of a string.

2. What is conditional rendering?
The component shows different JSX depending on comments.length. If there are no comments, it shows a message.

3. Why use index in key here?
Real comments should have unique backend IDs. Since this is mock frontend data, index helps create a temporary key.
*/
