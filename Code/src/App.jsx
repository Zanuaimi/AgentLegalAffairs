import { useEffect, useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DashboardCards from "./components/dashboard/DashboardCards";
import RequestTable from "./components/requests/RequestTable";
import RequestForm from "./components/requests/RequestForm";
import RequestDetails from "./components/requests/RequestDetails";
import AdminUsers from "./components/admin/AdminUsers";
import AuditLog from "./components/audit/AuditLog";
import LegalReviewers from "./components/reviewers/LegalReviewers";
import { navigationByRole } from "./config/navigation";
import {
  auditLogs as initialAuditLogs,
  initialRequests,
  initialUsers,
} from "./data/mockData";
import { formatDateTimeForAudit } from "./utils/dateFormat";
import {
  canManageDepartmentApproval,
  canManageManagerActions,
  canManageReview,
} from "./utils/permissions";
import {
  getSelectedVisibleRequest,
  getVisibleRequests,
} from "./utils/requestFilters";

function App() {
  // isLoggedIn controls whether the user sees auth screens or the main platform.
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // authMode decides whether to show LoginPage or RegisterPage.
  const [authMode, setAuthMode] = useState("login");

  // currentPage decides which main section is visible after login.
  const [currentPage, setCurrentPage] = useState("new-request");

  // currentUser is demo user information shown in the header.
  const [currentUser, setCurrentUser] = useState({
    name: "Demo User",
    username: "demo.user",
    email: "demo.user@university.edu",
    prefix: "None",
    role: "Requester",
    department: "HR",
  });

  // requests begins with mock data and can grow when the user submits a demo request.
  const [requests, setRequests] = useState(initialRequests);

  // users stores frontend demo users for the Admin page.
  const [users, setUsers] = useState(initialUsers);

  // auditLogs stores frontend demo audit events for admin users.
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);

  // selectedRequestId controls which request appears on the Request Details page.
  // It starts as null so users must open a request from a table before seeing details.
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // demoRole is the role perspective selected from the header dropdown.
  const [demoRole, setDemoRole] = useState("Requester");

  // demoDepartment is a frontend variable for future department-based visibility rules.
  const [demoDepartment, setDemoDepartment] = useState("HR");

  // theme remembers whether the user wants light mode or dark mode.
  // The function inside useState runs once when the app first loads.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("legal-affairs-theme");
    return savedTheme || "light";
  });

  const accessibleNavigation =
    navigationByRole[demoRole] || navigationByRole.Requester;
  const accessiblePageIds = accessibleNavigation.map((item) => item.id);

  // Requesters should see only their own requests. Legal roles can see all requests.
  const visibleRequests = getVisibleRequests({
    requests,
    role: demoRole,
    currentUser,
    department: demoDepartment,
  });
  const selectedRequest = getSelectedVisibleRequest({
    requests: visibleRequests,
    selectedRequestId,
  });
  const hasSelectedVisibleRequest = Boolean(selectedRequest);

  const navigationItemsForSidebar = accessibleNavigation.map((item) => {
    if (item.id !== "details") return item;

    return {
      ...item,
      disabled: !hasSelectedVisibleRequest,
      disabledReason: !hasSelectedVisibleRequest ? "Open a request first" : "",
    };
  });

  // useEffect runs after React updates the screen.
  // This effect applies the theme to the <html> tag and saves it across sessions.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("legal-affairs-theme", theme);
  }, [theme]);

  // When the selected role changes, move the user to the first page allowed for that role.
  useEffect(() => {
    if (!accessiblePageIds.includes(currentPage)) {
      setCurrentPage(accessibleNavigation[0].id);
    }
  }, [demoRole, currentPage, accessibleNavigation, accessiblePageIds]);

  // Changing role or department changes which requests are visible.
  // We clear the selected request so each role must intentionally open a row first.
  useEffect(() => {
    setSelectedRequestId(null);
  }, [demoRole, demoDepartment]);

  // If someone reaches Request Details without an opened request, send them back
  // to their request list. This supports the disabled sidebar and protects the route.
  useEffect(() => {
    if (currentPage === "details" && !hasSelectedVisibleRequest) {
      const fallbackPage = accessiblePageIds.includes("requests")
        ? "requests"
        : accessibleNavigation[0].id;

      setCurrentPage(fallbackPage);
    }
  }, [
    currentPage,
    hasSelectedVisibleRequest,
    accessiblePageIds,
    accessibleNavigation,
  ]);

  function handleLogin(user) {
    setCurrentUser(user);
    setDemoRole(user.role);
    setDemoDepartment(user.department);
    setSelectedRequestId(null);
    setIsLoggedIn(true);
    setCurrentPage(navigationByRole[user.role]?.[0]?.id || "new-request");
  }

  function handleToggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function handleLogout() {
    // BACKEND TODO: POST /api/auth/logout
    // In the real system, this would end the user's backend session/token.
    // For this frontend-only demo, we simply return to the login screen.

    setIsLoggedIn(false);
    setAuthMode("login");
  }

  function addAuditLog(action, user = currentUser.name, requestId = "System") {
    const newLog = {
      id: Date.now(),
      requestId,
      action,
      user,
      time: formatDateTimeForAudit(new Date()),
    };

    setAuditLogs((currentLogs) => [newLog, ...currentLogs]);
  }

  function handleCreateRequest(newRequest) {
    setRequests([newRequest, ...requests]);
    setSelectedRequestId(newRequest.id);
    addAuditLog("Request submitted", newRequest.requester, newRequest.id);

    // Requester users should return to My Requests so they can see the status.
    // Legal staff can go directly to the details screen.
    setCurrentPage(demoRole === "Requester" ? "requests" : "details");
  }

  function handleSelectRequest(requestId) {
    setSelectedRequestId(requestId);

    if (accessiblePageIds.includes("details")) {
      setCurrentPage("details");
    }
  }

  // If the user is not logged in, show Login or Register before showing the dashboard.
  if (!isLoggedIn) {
    if (authMode === "register") {
      return (
        <RegisterPage
          onRegister={handleLogin}
          onShowLogin={() => setAuthMode("login")}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onShowRegister={() => setAuthMode("register")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  function renderCurrentPage() {
    if (currentPage === "dashboard") {
      return <DashboardCards requests={requests} />;
    }

    if (currentPage === "requests") {
      return (
        <RequestTable
          requests={visibleRequests}
          onSelectRequest={handleSelectRequest}
          canOpenDetails={accessiblePageIds.includes("details")}
          title={
            demoRole === "Requester"
              ? "My Requests"
              : demoRole === "Department Approver"
                ? `Department Legal Requests for ${demoDepartment}`
                : "Legal Requests"
          }
          description={
            demoRole === "Requester"
              ? "View submitted requests and track their current status."
              : demoRole === "Department Approver"
                ? `Review legal requests for your current department: ${demoDepartment}.`
                : "Track request category, department, priority, reviewer, deadline, and status."
          }
        />
      );
    }

    if (currentPage === "new-request") {
      return (
        <RequestForm
          onCreateRequest={handleCreateRequest}
          currentUser={currentUser}
        />
      );
    }

    if (currentPage === "details") {
      return (
        <RequestDetails
          request={selectedRequest}
          canManageReview={canManageReview(demoRole)}
          canManageManagerActions={canManageManagerActions(demoRole)}
          canManageDepartmentApproval={canManageDepartmentApproval(demoRole)}
        />
      );
    }

    if (currentPage === "reviewers") {
      return (
        <LegalReviewers
          users={users}
          requests={requests}
          onSelectRequest={handleSelectRequest}
        />
      );
    }

    if (currentPage === "admin") {
      return (
        <AdminUsers
          users={users}
          setUsers={setUsers}
          onAuditEvent={addAuditLog}
          currentUser={currentUser}
        />
      );
    }

    if (currentPage === "audit") {
      return <AuditLog logs={auditLogs} />;
    }

    return (
      <RequestForm
        onCreateRequest={handleCreateRequest}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar
        currentPage={currentPage}
        onChangePage={setCurrentPage}
        navigationItems={navigationItemsForSidebar}
      />

      <div className="flex-1 min-w-0">
        <Header
          currentUser={currentUser}
          onLogout={handleLogout}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          viewingRole={demoRole}
          onViewingRoleChange={setDemoRole}
          viewingDepartment={demoDepartment}
          onViewingDepartmentChange={setDemoDepartment}
        />

        <main className="p-6 lg:p-8">{renderCurrentPage()}</main>
      </div>
    </div>
  );
}

export default App;

/*
BEGINNER DOCUMENTATION:

1. What is App.jsx?
App.jsx is the main React component. It controls the overall application flow.

2. What is state?
State is data that React remembers. When state changes, React updates the screen.
Examples in this file: isLoggedIn, currentPage, requests, selectedRequestId, demoRole, and theme.

3. What is conditional rendering?
Conditional rendering means showing different UI depending on state.
Example: if isLoggedIn is false, we show LoginPage or RegisterPage.

4. What is role-based navigation?
Role-based navigation means each role sees only the tabs it should use.
Requester sees Send Request and My Requests. Admin sees Admin. Legal users see Dashboard, Requests, and Details.

5. What is JSX?
JSX looks like HTML but is written inside JavaScript. React converts JSX into browser elements.

6. What are props?
Props pass data or functions from a parent component to a child component.
Example: <Header viewingRole={demoRole} /> passes the current viewing role to Header.

7. Why is there no backend code?
This task is frontend-only. Backend needs are written as BACKEND TODO comments so another developer can connect APIs later.

8. What is mock data?
Mock data is fake/demo data used so the frontend can work before the backend is ready.

9. What is useEffect?
useEffect runs code after React renders. Here it updates the page theme and keeps the current page valid for the selected role.

10. What is localStorage?
localStorage is browser storage. It keeps small pieces of information even after the page is refreshed or reopened.

11. What does document.documentElement mean?
document.documentElement refers to the <html> tag. We add the "dark" class there so dark mode styles apply across the app.
*/
