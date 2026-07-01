import kuLogo from "../../../Assets/KULogo.png";

function Sidebar({ currentPage, onChangePage, navigationItems }) {
  return (
    <aside className="w-full lg:w-72 bg-slate-950 text-white p-5 lg:min-h-screen">
      <div className="mb-10">
        <img
          className="h-20 w-40 rounded-2xl bg-white object-contain p-4"
          src={kuLogo}
          alt="Khalifa University logo"
        />
        <div className="mt-5">
          <p className="text-xs uppercase tracking-widest text-blue-300">
            University
          </p>
          <h2 className="text-3xl font-bold mt-2 leading-tight">
            Legal Affairs
          </h2>
          <p className="text-lg text-slate-400 mt-4 leading-snug">
            Request Management Platform
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = currentPage === item.id;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (!isDisabled) onChangePage(item.id);
              }}
              disabled={isDisabled}
              title={item.disabledReason}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : isDisabled
                    ? "cursor-not-allowed text-slate-500 opacity-70"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span>{item.label}</span>
              {isDisabled && item.disabledReason && (
                <span className="mt-1 block text-xs text-slate-500">
                  {item.disabledReason}
                </span>
              )}
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
Navigation lets the user move between app sections, such as Dashboard and New Request. Disabled navigation items are visible but cannot be clicked until the requirement is met.

2. What is role-based navigation?
Role-based navigation means the tabs shown in the sidebar depend on the selected role/perspective.

3. What is conditional styling?
We change the button classes depending on whether the item is active. This highlights the current page.

4. What is a template literal?
The backtick string with ${} lets JavaScript insert values into a string.

5. Why does Sidebar receive navigationItems as a prop?
App.jsx decides which tabs are allowed. Sidebar only displays the tabs it receives.
*/
