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
  getExistingSupabaseSessionUser,
  loginWithSupabase,
  logoutFromSupabase,
  registerWithSupabase,
} from "./services/authService";
import {
  createBackendAuditLog,
  createBackendDepartmentApproval,
  createBackendManagerAction,
  createBackendRequest,
  createBackendRequestComment,
  fetchBackendAuditLogs,
  fetchBackendRequests,
  fetchBackendUsers,
  updateBackendChecklistItem,
  updateBackendUserDepartment,
  updateBackendUserRole,
} from "./services/backendDataService";
import {
  isSupabaseConfigured,
  missingSupabaseEnvVars,
} from "./services/supabaseClient";
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

  // currentUser is loaded from Supabase Auth + public.profiles after login.
  const [currentUser, setCurrentUser] = useState({
    id: "demo-user",
    name: "Demo User",
    username: "demo.user",
    email: "demo.user@university.edu",
    prefix: "None",
    role: "Requester",
    department: "HR",
  });

  // These collections are loaded from Supabase PostgreSQL after login.
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // selectedRequestId controls which request appears on the Request Details page.
  // It starts as null so users must open a request from a table before seeing details.
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // currentRole/currentDepartment come from the logged-in user's database profile.
  const [currentRole, setCurrentRole] = useState("Requester");
  const [currentDepartment, setCurrentDepartment] = useState("HR");

  const [backendMessage, setBackendMessage] = useState(
    isSupabaseConfigured
      ? "Checking Supabase backend connection..."
      : `Supabase is not configured. Missing: ${missingSupabaseEnvVars.join(
          ", ",
        )}.`,
  );

  // theme remembers whether the user wants light mode or dark mode.
  // The function inside useState runs once when the app first loads.
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("legal-affairs-theme");
    return savedTheme || "light";
  });

  const accessibleNavigation =
    navigationByRole[currentRole] || navigationByRole.Requester;
  const accessiblePageIds = accessibleNavigation.map((item) => item.id);

  // Requesters should see only their own requests. Legal roles can see all requests.
  const visibleRequests = getVisibleRequests({
    requests,
    role: currentRole,
    currentUser,
    department: currentDepartment,
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

  useEffect(() => {
    async function restoreSession() {
      if (!isSupabaseConfigured) return;

      try {
        const sessionUser = await getExistingSupabaseSessionUser();
        if (!sessionUser) {
          setBackendMessage("Supabase backend configured. Please sign in.");
          return;
        }

        setCurrentUser(sessionUser);
        setCurrentRole(sessionUser.role);
        setCurrentDepartment(sessionUser.department);
        setIsLoggedIn(true);
        setCurrentPage(
          navigationByRole[sessionUser.role]?.[0]?.id || "requests",
        );
        await loadBackendData();
      } catch (error) {
        setBackendMessage(
          `Supabase backend is unavailable or not seeded: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    restoreSession();
  }, []);

  // When the selected role changes, move the user to the first page allowed for that role.
  useEffect(() => {
    if (!accessiblePageIds.includes(currentPage)) {
      setCurrentPage(accessibleNavigation[0].id);
    }
  }, [currentRole, currentPage, accessibleNavigation, accessiblePageIds]);

  // Changing role or department changes which requests are visible.
  // We clear the selected request so each role must intentionally open a row first.
  useEffect(() => {
    setSelectedRequestId(null);
  }, [currentRole, currentDepartment]);

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

  async function loadBackendData() {
    if (!isSupabaseConfigured) {
      throw new Error(
        `Supabase env vars are missing: ${missingSupabaseEnvVars.join(", ")}`,
      );
    }

    const [backendRequests, backendUsers, backendAuditLogs] = await Promise.all(
      [
        fetchBackendRequests(),
        fetchBackendUsers(),
        fetchBackendAuditLogs().catch(() => []),
      ],
    );

    setRequests(backendRequests);
    setUsers(backendUsers);
    setAuditLogs(backendAuditLogs);
    setBackendMessage("Loaded data from Supabase PostgreSQL.");
  }

  async function applyAuthenticatedUser(user) {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setCurrentDepartment(user.department);
    setSelectedRequestId(null);
    setIsLoggedIn(true);
    setCurrentPage(navigationByRole[user.role]?.[0]?.id || "requests");
    await loadBackendData();
  }

  async function handleLogin(credentials) {
    const loggedInUser = await loginWithSupabase(
      credentials.username,
      credentials.password,
    );

    await applyAuthenticatedUser(loggedInUser);
  }

  async function handleRegister(formData) {
    const registeredUser = await registerWithSupabase(formData);
    await applyAuthenticatedUser(registeredUser);
  }

  function handleToggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  async function handleLogout() {
    if (isSupabaseConfigured) {
      await logoutFromSupabase();
    }

    setIsLoggedIn(false);
    setAuthMode("login");
    setSelectedRequestId(null);
  }

  async function addAuditLog(
    action,
    user = currentUser.name,
    requestId = "System",
  ) {
    const newLog = {
      id: Date.now(),
      requestId,
      action,
      user,
      time: formatDateTimeForAudit(new Date()),
    };

    setAuditLogs((currentLogs) => [newLog, ...currentLogs]);

    if (isSupabaseConfigured) {
      try {
        await createBackendAuditLog(action, currentUser, requestId);
      } catch (error) {
        setBackendMessage(
          `Audit log saved locally but not in Supabase: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  async function handleCreateRequest(newRequest) {
    try {
      if (isSupabaseConfigured) {
        await createBackendRequest(newRequest, currentUser);
      }

      const requestForState = { ...newRequest };
      delete requestForState.uploadFile;

      setRequests([requestForState, ...requests]);
      setSelectedRequestId(requestForState.id);
      await addAuditLog(
        "Request submitted",
        newRequest.requester,
        newRequest.id,
      );

      // Requester users should return to My Requests so they can see the status.
      // Legal staff can go directly to the details screen.
      setCurrentPage(currentRole === "Requester" ? "requests" : "details");
    } catch (error) {
      setBackendMessage(
        `Could not save request to Supabase: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  async function handleAddRequestComment(requestId, commentText) {
    if (isSupabaseConfigured) {
      await createBackendRequestComment({
        requestId,
        currentUser,
        commentText,
      });
    }

    setRequests((currentRequests) =>
      currentRequests.map((request) => {
        if (request.id !== requestId) return request;

        return {
          ...request,
          reviewerComments: [
            ...(request.reviewerComments || []),
            {
              authorName: currentUser.name,
              authorRole: currentUser.role,
              text: commentText,
            },
          ],
        };
      }),
    );
  }

  async function handleManagerDecision(requestId, decision) {
    const savedDecision = await createBackendManagerAction({
      requestId,
      currentUser,
      decision,
    });

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              managerDecision: savedDecision.managerDecision,
              status: savedDecision.status,
            }
          : request,
      ),
    );

    await addAuditLog(decision, currentUser.name, requestId);
    return savedDecision;
  }

  async function handleDepartmentApproval(requestId, decision, commentText) {
    const savedDecision = await createBackendDepartmentApproval({
      requestId,
      currentUser,
      decision,
      commentText,
    });

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              departmentDecision: savedDecision.departmentDecision,
              status: savedDecision.status,
            }
          : request,
      ),
    );

    await addAuditLog(decision, currentUser.name, requestId);
    return savedDecision;
  }

  async function handleChecklistItemToggle({
    requestId,
    documentId,
    checklistItemId,
    criteria,
    checked,
  }) {
    await updateBackendChecklistItem({ checklistItemId, checked });

    setRequests((currentRequests) =>
      currentRequests.map((request) => {
        if (request.id !== requestId) return request;

        return {
          ...request,
          documents: request.documents.map((document) => {
            if (document.id !== documentId) return document;

            return {
              ...document,
              checklist: document.checklist.map((item) =>
                item.id === checklistItemId ? { ...item, checked } : item,
              ),
            };
          }),
        };
      }),
    );

    await addAuditLog(
      `${checked ? "Checked" : "Unchecked"} checklist item: ${criteria}`,
      currentUser.name,
      requestId,
    );
  }

  async function handleUpdateUserRole(userId, newRole) {
    await updateBackendUserRole({ userId, roleName: newRole });
  }

  async function handleUpdateUserDepartment(userId, newDepartment) {
    await updateBackendUserDepartment({
      userId,
      departmentName: newDepartment,
    });
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
          onRegister={handleRegister}
          onShowLogin={() => setAuthMode("login")}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          backendMessage={backendMessage}
        />
      );
    }

    return (
      <LoginPage
        onLogin={handleLogin}
        onShowRegister={() => setAuthMode("register")}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        backendMessage={backendMessage}
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
            currentRole === "Requester"
              ? "My Requests"
              : currentRole === "Department Approver"
                ? `Department Legal Requests for ${currentDepartment}`
                : "Legal Requests"
          }
          description={
            currentRole === "Requester"
              ? "View submitted requests and track their current status."
              : currentRole === "Department Approver"
                ? `Review legal requests for your current department: ${currentDepartment}.`
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
          currentUser={currentUser}
          canManageReview={canManageReview(currentRole)}
          canManageManagerActions={canManageManagerActions(currentRole)}
          canManageDepartmentApproval={canManageDepartmentApproval(currentRole)}
          onAddComment={(commentText) =>
            handleAddRequestComment(selectedRequest.id, commentText)
          }
          onManagerDecisionChange={(decision) =>
            handleManagerDecision(selectedRequest.id, decision)
          }
          onDepartmentDecisionChange={(decision, commentText) =>
            handleDepartmentApproval(selectedRequest.id, decision, commentText)
          }
          onChecklistItemToggle={handleChecklistItemToggle}
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
          onUpdateUserRole={handleUpdateUserRole}
          onUpdateUserDepartment={handleUpdateUserDepartment}
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
        />

        <main className="p-6 lg:p-8">
          {backendMessage && (
            <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              {backendMessage}
            </div>
          )}
          {renderCurrentPage()}
        </main>
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
Examples in this file: isLoggedIn, currentPage, requests, selectedRequestId, currentRole, and theme.

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
Example: <Header currentUser={currentUser} /> passes the logged-in user profile to Header.

7. Where is the backend now?
The app uses Supabase Auth and PostgreSQL for login, requests, comments, checklist updates, approvals, profile changes, audit logs, PDF storage, and the Gemini Edge Function.

8. What happens if Supabase is stopped?
The app shows a backend message and protected actions fail clearly instead of silently hiding the backend problem.

9. What is useEffect?
useEffect runs code after React renders. Here it updates the page theme and keeps the current page valid for the selected role.

10. What is localStorage?
localStorage is browser storage. It keeps small pieces of information even after the page is refreshed or reopened.

11. What does document.documentElement mean?
document.documentElement refers to the <html> tag. We add the "dark" class there so dark mode styles apply across the app.
*/
