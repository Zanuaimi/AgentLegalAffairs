import kuLogo from "../../../Assets/KULogo.png";

function Sidebar({ currentPage, onChangePage, navigationItems }) {
  return (
    <aside className="w-full lg:w-72 bg-slate-950 text-white p-5 lg:min-h-screen">
      <div className="mb-8 flex items-start gap-3">
        <img
          className="h-12 w-12 rounded-xl bg-white object-contain p-1"
          src={kuLogo}
          alt="Khalifa University logo"
        />
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-300">
            University
          </p>
          <h2 className="text-xl font-bold mt-1">Legal Affairs</h2>
          <p className="text-sm text-slate-400 mt-2">
            Request Management Platform
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangePage(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;

/*
BEGINNER DOCUMENTATION:

1. What is navigation?
Navigation lets the user move between app sections, such as Dashboard and New Request.

2. What is role-based navigation?
Role-based navigation means the tabs shown in the sidebar depend on the selected role/perspective.

3. What is conditional styling?
We change the button classes depending on whether the item is active. This highlights the current page.

4. What is a template literal?
The backtick string with ${} lets JavaScript insert values into a string.

5. Why does Sidebar receive navigationItems as a prop?
App.jsx decides which tabs are allowed. Sidebar only displays the tabs it receives.
*/
