import { useState } from 'react';
import { departments, legalCategories, priorityLevels } from '../../data/mockData';

function RequestForm({ onCreateRequest }) {
  const [formData, setFormData] = useState({
    title: '',
    requester: '',
    department: 'HR',
    categoryCode: 'LEG-A',
    priority: 'Medium',
    deadline: '',
    description: '',
    documentName: '',
  });

  function updateField(fieldName, value) {
    setFormData({ ...formData, [fieldName]: value });
  }

  function handleSubmit(event) {
    event.preventDefault();

    const selectedCategory = legalCategories.find((category) => category.code === formData.categoryCode);

    const newRequest = {
      id: `LA-2026-${Math.floor(Math.random() * 900 + 100)}`,
      title: formData.title || 'Untitled Legal Request',
      categoryCode: formData.categoryCode,
      categoryName: selectedCategory.name,
      department: formData.department,
      requester: formData.requester || 'Demo Requester',
      assignedReviewer: 'Not Assigned',
      priority: formData.priority,
      riskLevel: 'Not Classified',
      status: 'New',
      deadline: formData.deadline || 'No deadline selected',
      description: formData.description,
      documents: formData.documentName ? [formData.documentName] : [],
      aiSummary: 'AI draft not generated yet.',
      reviewerComments: [],
    };

    // BACKEND TODO: POST /api/requests
    // Send newRequest to the backend so it can be saved in the real database.

    // BACKEND TODO: POST /api/documents/upload
    // Upload the selected document file to backend document storage.

    onCreateRequest(newRequest);

    setFormData({
      title: '',
      requester: '',
      department: 'HR',
      categoryCode: 'LEG-A',
      priority: 'Medium',
      deadline: '',
      description: '',
      documentName: '',
    });
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">New Legal Request</h2>
        <p className="text-slate-500 mt-1">Submit request details, category, priority, deadline, and supporting document.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Request Title</label>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3" value={formData.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Example: Review vendor agreement" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Requester Name</label>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3" value={formData.requester} onChange={(event) => updateField('requester', event.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
          <select className="w-full rounded-lg border border-slate-300 px-4 py-3" value={formData.department} onChange={(event) => updateField('department', event.target.value)}>
            {departments.map((department) => <option key={department}>{department}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Legal Category</label>
          <select className="w-full rounded-lg border border-slate-300 px-4 py-3" value={formData.categoryCode} onChange={(event) => updateField('categoryCode', event.target.value)}>
            {legalCategories.map((category) => (
              <option key={category.code} value={category.code}>{category.code} - {category.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <select className="w-full rounded-lg border border-slate-300 px-4 py-3" value={formData.priority} onChange={(event) => updateField('priority', event.target.value)}>
            {priorityLevels.map((priority) => <option key={priority}>{priority}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3" type="date" value={formData.deadline} onChange={(event) => updateField('deadline', event.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Document Upload</label>
          <input className="w-full rounded-lg border border-slate-300 px-4 py-3" type="file" onChange={(event) => updateField('documentName', event.target.files[0]?.name || '')} />
          <p className="text-xs text-slate-500 mt-1">Frontend stores only the file name in this demo.</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea className="w-full rounded-lg border border-slate-300 px-4 py-3 min-h-32" value={formData.description} onChange={(event) => updateField('description', event.target.value)} />
        </div>

        <div className="md:col-span-2">
          <button className="bg-blue-700 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-800" type="submit">
            Submit Demo Request
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
It lets the user choose a file from their computer. In this demo, we only show the file name.

4. Why no real upload?
The project is frontend-only. Real upload requires backend storage, so we leave a BACKEND TODO comment.
*/
