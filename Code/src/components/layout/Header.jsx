import { roles } from "../../data/mockData";

function Header({
  currentUser,
  onLogout,
  theme,
  onToggleTheme,
  viewingRole,
  onViewingRoleChange,
}) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Version 1 Frontend Prototype
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Frontend only: all data is mock data and backend requests are
          comments.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-semibold">Viewing as</span>
          <select
            className="rounded-lg border border-slate-300 px-3 py-2"
            value={viewingRole}
            onChange={(event) => onViewingRoleChange(event.target.value)}
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xl leading-none"
          onClick={onToggleTheme}
          aria-label="Toggle light and dark mode"
          title={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        <div className="text-right">
          <p className="font-semibold text-slate-800">{currentUser.name}</p>
          <p className="text-xs text-slate-500">
            Actual demo login • {currentUser.department}
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;

/*
BEGINNER DOCUMENTATION:

1. What is a header?
A header is the top part of a page. It often shows the title, user information, and actions.

2. What are props?
currentUser, onLogout, theme, onToggleTheme, viewingRole, and onViewingRoleChange are props from App.jsx.

3. What is the Viewing as dropdown?
It lets you test the frontend from different role perspectives without real backend login.

4. What does the icon-only theme button do?
It calls onToggleTheme, which changes the app between light mode and dark mode. The title attribute explains the icon when hovering.

5. What is aria-label?
aria-label gives screen readers a clear description of an icon-only button, which improves accessibility.
*/
