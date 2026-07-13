import { useState } from "react";
import { departments, roles } from "../../data/mockData";

function AdminUsers({
  users,
  setUsers,
  onAuditEvent,
  currentUser,
  activeUserIds,
  onUpdateUserRole,
  onUpdateUserDepartment,
}) {
  const [savingUserId, setSavingUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function updateUserRole(userId, newRole) {
    const selectedUser = users.find((user) => user.id === userId);
    if (!selectedUser || selectedUser.role === newRole) return;

    setSavingUserId(userId);
    setErrorMessage("");
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user,
      ),
    );

    try {
      await onUpdateUserRole(userId, newRole);
      await onAuditEvent(
        `Changed ${selectedUser.username}'s role from ${selectedUser.role} to ${newRole}`,
        currentUser.name,
        "Admin",
      );
    } catch (error) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: selectedUser.role } : user,
        ),
      );
      setErrorMessage(
        error instanceof Error ? error.message : "Could not save user role.",
      );
    } finally {
      setSavingUserId("");
    }
  }

  async function updateUserDepartment(userId, newDepartment) {
    const selectedUser = users.find((user) => user.id === userId);
    if (!selectedUser || selectedUser.department === newDepartment) return;

    setSavingUserId(userId);
    setErrorMessage("");
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === userId ? { ...user, department: newDepartment } : user,
      ),
    );

    try {
      await onUpdateUserDepartment(userId, newDepartment);
      await onAuditEvent(
        `Changed ${selectedUser.username}'s department from ${selectedUser.department} to ${newDepartment}`,
        currentUser.name,
        "Admin",
      );
    } catch (error) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? { ...user, department: selectedUser.department }
            : user,
        ),
      );
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save user department.",
      );
    } finally {
      setSavingUserId("");
    }
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          Admin: Manage Users & Roles
        </h2>
        <p className="text-slate-500 mt-1">
          Manage Supabase profile roles and departments. Active status updates from
          the users currently connected to the website.
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
                <tr
                  key={user.id}
                  className="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">
                      @{user.username} • {user.id}
                    </p>
                  </td>
                  <td className="p-4 text-slate-700">{user.email}</td>
                  <td className="p-4">
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={user.role}
                      onChange={(event) =>
                        updateUserRole(user.id, event.target.value)
                      }
                      disabled={savingUserId === user.id}
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2"
                      value={user.department}
                      onChange={(event) =>
                        updateUserDepartment(user.id, event.target.value)
                      }
                      disabled={savingUserId === user.id}
                    >
                      {departments.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    {activeUserIds.includes(user.id) ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          {errorMessage}
        </div>
      )}

      <div className="mt-5 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-slate-700">
        <p className="font-semibold text-blue-950">Security note</p>
        <p className="mt-2">
          The UI saves profile changes to Supabase, but backend RLS policies must
          still enforce who is allowed to manage users.
        </p>
      </div>
    </section>
  );
}

export default AdminUsers;

/*
BEGINNER DOCUMENTATION:

1. What is an admin page?
An admin page is used by administrators to manage system settings, users, roles, and permissions.

2. What is stateful table data?
The users table is stored in App.jsx state, so changing a role immediately updates what appears on screen and stays visible when switching pages.

3. What does map do here?
map loops through every user and creates one table row for each user.

4. What is an audit event?
An audit event records an important action, such as changing a user's role or department.

5. Why is this not real security?
Frontend restrictions can be changed by a user in the browser. Real role security must also be checked by the backend.
*/
