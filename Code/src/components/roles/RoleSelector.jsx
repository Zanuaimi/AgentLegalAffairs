import { departments, roles } from '../../data/mockData';

function RoleSelector({ demoRole, demoDepartment, onRoleChange, onDepartmentChange }) {
  const permissionExamples = {
    Requester: ['Submit legal request', 'Upload documents', 'View own requests', 'Respond to clarification'],
    'Legal Reviewer': ['Review documents', 'Add comments', 'Use checklist', 'Prepare draft response'],
    'Legal Manager': ['Assign reviewers', 'Approve responses', 'Monitor dashboard', 'Close or escalate requests'],
    'Department Approver': ['Review department content', 'Approve department section', 'Add department comments'],
    'Admin User': ['Manage users', 'Manage roles', 'Manage categories', 'View system configuration'],
  };

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Roles / Admin Demo</h2>
        <p className="text-slate-500 mt-1">Frontend-only role-based access control placeholder.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="font-bold text-slate-900">Demo User Context</h3>
          <p className="text-sm text-slate-500 mt-1">HR is treated as a department, not a role.</p>

          <div className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
              <select className="w-full rounded-lg border border-slate-300 px-4 py-3" value={demoRole} onChange={(event) => onRoleChange(event.target.value)}>
                {roles.map((role) => <option key={role}>{role}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <select className="w-full rounded-lg border border-slate-300 px-4 py-3" value={demoDepartment} onChange={(event) => onDepartmentChange(event.target.value)}>
                {departments.map((department) => <option key={department}>{department}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5">
          <h3 className="font-bold text-slate-900">Example Permissions</h3>
          <ul className="mt-4 space-y-2">
            {permissionExamples[demoRole].map((permission) => (
              <li key={permission} className="flex gap-2 text-slate-700">
                <span className="text-green-600">✓</span>
                <span>{permission}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* BACKEND TODO: GET /api/auth/me to fetch logged-in user role and department. */}
      {/* BACKEND TODO: GET /api/roles to fetch real role permissions. */}
    </section>
  );
}

export default RoleSelector;

/*
BEGINNER DOCUMENTATION:

1. What is role-based access control?
It means users can only access actions allowed for their role.

2. Is this real security?
No. This is only a frontend demo. Real security must be enforced by the backend.

3. What is a JavaScript object used as a dictionary?
permissionExamples stores role names as keys and permission arrays as values.

4. Why separate role and department?
A role describes what the user can do. A department describes where the user works, such as HR or Finance.
*/
