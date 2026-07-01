import { useState } from 'react';
import { departments, initialUsers, roles } from '../../data/mockData';

function AdminUsers() {
  // This state stores the demo users shown in the admin table.
  const [users, setUsers] = useState(initialUsers);

  function updateUserRole(userId, newRole) {
    // BACKEND TODO: PATCH /api/users/:id/role
    // In the real system, this would save the user's new role in the backend.

    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );
  }

  function updateUserDepartment(userId, newDepartment) {
    // BACKEND TODO: PATCH /api/users/:id/department
    // In the real system, this would save the user's new department in the backend.

    setUsers(
      users.map((user) =>
        user.id === userId ? { ...user, department: newDepartment } : user,
      ),
    );
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Admin: Manage Users & Roles</h2>
        <p className="text-slate-500 mt-1">
          Frontend-only admin page using dummy users from the project data.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Department</th>
                <th className="text-left p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.id}</p>
                  </td>
                  <td className="p-4 text-slate-700">{user.email}</td>
                  <td className="p-4">
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={user.role}
                      onChange={(event) => updateUserRole(user.id, event.target.value)}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={user.department}
                      onChange={(event) => updateUserDepartment(user.id, event.target.value)}
                    >
                      {departments.map((department) => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-slate-700">
        <p className="font-semibold text-blue-950">Frontend-only note</p>
        <p className="mt-2">
          Changing roles here only updates the browser state. A real backend must enforce permissions securely.
        </p>
      </div>

      {/* BACKEND TODO: GET /api/users to fetch real users. */}
      {/* BACKEND TODO: PATCH /api/users/:id/role to update a user's role. */}
    </section>
  );
}

export default AdminUsers;

/*
BEGINNER DOCUMENTATION:

1. What is an admin page?
An admin page is used by administrators to manage system settings, users, roles, and permissions.

2. What is stateful table data?
The users table is stored in React state, so changing a role immediately updates what appears on screen.

3. What does map do here?
map loops through every user and creates one table row for each user.

4. What is an inline update?
The role and department dropdowns let the admin update values directly inside the table.

5. Why is this not real security?
Frontend restrictions can be changed by a user in the browser. Real role security must also be checked by the backend.
*/
