import { useEffect, useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import ForgotPasswordPage from "./components/auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/auth/ResetPasswordPage";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import DashboardCards from "./components/dashboard/DashboardCards";
import RequestTable from "./components/requests/RequestTable";
import RequestForm from "./components/requests/RequestForm";
import RequestDetails from "./components/requests/RequestDetails";
import AdminUsers from "./components/admin/AdminUsers";
import LegalAffairEngine from "./components/admin/LegalAffairEngine";
import AuditLog from "./components/audit/AuditLog";
import LegalReviewers from "./components/reviewers/LegalReviewers";
import { navigationByRole } from "./config/navigation";

import {
  changePasswordWithSupabase,
  getExistingSupabaseSessionUser,
  loginWithSupabase,
  logoutFromSupabase,
  registerWithSupabase,
  requestPasswordReset,
  resetPasswordWithSupabase,
} from "./services/authService";
import {
  assignReviewerAsManager,
  createBackendAuditLog,
  createBackendDepartmentApproval,
  createBackendManagerAction,
  createBackendRequest,
  createBackendRequestComment,
  createLegalAffairEngineEvent,
  routeRequestAsReviewer,
  fetchBackendAuditLogs,
  fetchBackendRequests,
  fetchBackendUsers,
  fetchLegalAffairEngineEvents,
  fetchLegalAffairEngineState,
  setLegalAffairEngineRunning,
  updateAiReviewJobQueueOrder,
  updateBackendChecklistItem,
  updateBackendUserDepartment,
  updateBackendUserRole,
} from "./services/backendDataService";
import {
  isSupabaseConfigured,
  missingSupabaseEnvVars,
  supabase,
} from "./services/supabaseClient";
import { triggerAiReviewQueue } from "./services/legalReviewApi";
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

function describeAppError(value) {
  if (!value) return "Unknown error";
  if (typeof value === "string") return value;

  if (value instanceof Error) {
    if (value.message && value.message !== "[object Object]") {
      return value.message;
    }
  }

  if (typeof value === "object") {
    const candidates = [
      value.message,
      value.error,
      value.details,
      value.hint,
      value.statusText,
      value.name,
    ].filter(Boolean);

    if (candidates.length > 0) {
      const described = candidates.map(describeAppError).join(" | ");
      if (described && described !== "[object Object]") return described;
    }

    try {
      return JSON.stringify(value);
    } catch (_error) {
      return String(value);
    }
  }

  return String(value);
}

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
    department: "Legal Affairs",
  });

  // These collections are loaded from Supabase PostgreSQL after login.
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [engineState, setEngineState] = useState(null);
  const [engineEvents, setEngineEvents] = useState([]);
  const [activeUserIds, setActiveUserIds] = useState([]);

  // selectedRequestId controls which request appears on the Request Details page.
  // It starts as null so users must open a request from a table before seeing details.
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  // currentRole/currentDepartment come from the logged-in user's database profile.
  const [currentRole, setCurrentRole] = useState("Requester");
  const [currentDepartment, setCurrentDepartment] = useState("Legal Affairs");

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

      if (new URLSearchParams(window.location.search).get("password-reset") === "true") {
        setAuthMode("reset-password");
        setBackendMessage("Choose a new password to finish the recovery process.");
        return;
      }

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
        await loadBackendData(sessionUser);
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

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return undefined;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsLoggedIn(false);
        setAuthMode("reset-password");
        setBackendMessage("Choose a new password to finish the recovery process.");
      }
    });

    return () => subscription.unsubscribe();
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

  // Every signed-in browser joins this presence channel. Unlike a database status,
  // Presence automatically clears when a browser disconnects or signs out.
  useEffect(() => {
    if (!isLoggedIn || !isSupabaseConfigured || !supabase || !currentUser?.id) {
      setActiveUserIds([]);
      return undefined;
    }

    setActiveUserIds([currentUser.id]);

    const presenceChannel = supabase.channel("legal-affairs-user-presence", {
      config: { presence: { key: currentUser.id } },
    });

    const syncActiveUsers = () => {
      const ids = [
        ...new Set(
          Object.values(presenceChannel.presenceState())
            .flat()
            .map((presence) => presence.userId)
            .filter(Boolean),
        ),
      ];
      setActiveUserIds(ids);
    };

    presenceChannel
      .on("presence", { event: "sync" }, syncActiveUsers)
      .on("presence", { event: "join" }, syncActiveUsers)
      .on("presence", { event: "leave" }, syncActiveUsers)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({ userId: currentUser.id });
        }
      });

    return () => {
      presenceChannel.untrack();
      supabase.removeChannel(presenceChannel);
    };
  }, [isLoggedIn, currentUser?.id]);

  async function loadBackendData(userForAccess = currentUser) {
    if (!isSupabaseConfigured) {
      throw new Error(
        `Supabase env vars are missing: ${missingSupabaseEnvVars.join(", ")}`,
      );
    }

    const canReadEngineData = ["Admin User", "Owner"].includes(
      userForAccess.role,
    );

    const [
      backendRequests,
      backendUsers,
      backendAuditLogs,
      backendEngineState,
      backendEngineEvents,
    ] = await Promise.all([
      fetchBackendRequests(),
      fetchBackendUsers(),
      fetchBackendAuditLogs().catch(() => []),
      canReadEngineData ? fetchLegalAffairEngineState().catch(() => null) : null,
      canReadEngineData ? fetchLegalAffairEngineEvents().catch(() => []) : [],
    ]);

    setRequests(backendRequests);
    setUsers(backendUsers);
    setAuditLogs(backendAuditLogs);
    setEngineState(backendEngineState);
    setEngineEvents(backendEngineEvents);
    // A successful background load does not need a persistent banner in the UI.
    setBackendMessage("");
  }

  const hasActiveAiReview = requests.some((request) =>
    ["AI Review Pending", "AI Review Processing"].includes(request.status),
  );

  useEffect(() => {
    const shouldPollAiState =
      isLoggedIn &&
      isSupabaseConfigured &&
      (hasActiveAiReview || currentPage === "legal-engine");

    if (!shouldPollAiState) return undefined;

    const intervalId = window.setInterval(async () => {
      try {
        const [
          refreshedRequests,
          refreshedEngineState,
          refreshedEngineEvents,
        ] = await Promise.all([
          fetchBackendRequests(),
          currentPage === "legal-engine"
            ? fetchLegalAffairEngineState().catch(() => null)
            : Promise.resolve(engineState),
          currentPage === "legal-engine"
            ? fetchLegalAffairEngineEvents().catch(() => [])
            : Promise.resolve(engineEvents),
        ]);
        setRequests(refreshedRequests);
        setEngineState(refreshedEngineState);
        setEngineEvents(refreshedEngineEvents);
      } catch (error) {
        setBackendMessage(
          `Could not refresh AI review queue status: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [isLoggedIn, hasActiveAiReview, currentPage]);

  async function applyAuthenticatedUser(user) {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setCurrentDepartment(user.department);
    setSelectedRequestId(null);
    setIsLoggedIn(true);
    setCurrentPage(navigationByRole[user.role]?.[0]?.id || "requests");
    await loadBackendData(user);
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


  async function handleRequestPasswordReset(email) {
    await requestPasswordReset(email);
  }

  async function handleResetPassword(newPassword) {
    await resetPasswordWithSupabase(newPassword);
    window.history.replaceState({}, document.title, window.location.pathname);
    setIsLoggedIn(false);
    setAuthMode("login");
    setBackendMessage("Password updated. Sign in again with your new password.");
  }

  async function handleChangePassword({ currentPassword, newPassword }) {
    await changePasswordWithSupabase({
      email: currentUser.email,
      currentPassword,
      newPassword,
    });
    setIsLoggedIn(false);
    setAuthMode("login");
    setSelectedRequestId(null);
    setBackendMessage("Password changed. All sessions were signed out; sign in again.");
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
      const savedRequest = isSupabaseConfigured
        ? await createBackendRequest(newRequest, currentUser)
        : newRequest;

      const requestForState = { ...savedRequest };
      delete requestForState.uploadFile;

      setRequests([requestForState, ...requests]);
      setSelectedRequestId(requestForState.id);
      await addAuditLog(
        "Request submitted; AI review queued",
        newRequest.requester,
        newRequest.id,
      );

      if (isSupabaseConfigured) {
        triggerAiReviewQueue()
          .then(async () => {
            const refreshedRequests = await fetchBackendRequests();
            setRequests(refreshedRequests);
          })
          .catch(async (error) => {
            const message = describeAppError(error);
            await createLegalAffairEngineEvent({
              eventType: "requester_queue_trigger_failed",
              level: "error",
              message: `Requester submitted ${newRequest.id}, but the browser could not start/observe AI queue processing: ${message}`,
              currentUser,
              requestId: newRequest.id,
            }).catch(() => {});
            setBackendMessage(
              `Request was saved, but AI queue processing did not start: ${message}`,
            );
          });
      }

      // Requester users should return to My Requests so they can see the status.
      // Legal staff can go directly to the details screen.
      setCurrentPage(currentRole === "Requester" ? "requests" : "details");
    } catch (error) {
      const message = `Could not save request to Supabase: ${
        error instanceof Error ? error.message : String(error)
      }`;
      setBackendMessage(message);
      // Let RequestForm keep the user's entered data and selected PDF on failure.
      throw new Error(message);
    }
  }

  async function refreshRequestsAndEngineState() {
    const [refreshedRequests, refreshedEngineState, refreshedEngineEvents] =
      await Promise.all([
        fetchBackendRequests(),
        fetchLegalAffairEngineState().catch(() => null),
        fetchLegalAffairEngineEvents().catch(() => []),
      ]);

    setRequests(refreshedRequests);
    setEngineState(refreshedEngineState);
    setEngineEvents(refreshedEngineEvents);
  }

  async function handleEngineRunningChange(isRunning) {
    const nextEngineState = await setLegalAffairEngineRunning(
      isRunning,
      currentUser,
    );
    setEngineState(nextEngineState);
    await createLegalAffairEngineEvent({
      eventType: isRunning ? "engine_started" : "engine_stopped",
      level: "status",
      message: `${currentUser.name} ${isRunning ? "started" : "stopped"} the Legal Affair Engine.`,
      currentUser,
    });
    await refreshRequestsAndEngineState();
    await addAuditLog(
      `${isRunning ? "Started" : "Stopped"} Legal Affair Engine`,
      currentUser.name,
      "System",
    );
  }

  async function handleProcessNextAiReviewJob() {
    try {
      await createLegalAffairEngineEvent({
        eventType: "manual_process_next_requested",
        level: "status",
        message: `${currentUser.name} requested processing for the next queued or stale AI review job. Jobs stuck in processing for 1+ minute can be reclaimed.`,
        currentUser,
      });
      const result = await triggerAiReviewQueue({ staleAfterMinutes: 1 });
      await createLegalAffairEngineEvent({
        eventType: "manual_process_next_finished",
        level: result?.processed ? "status" : "warning",
        message: result?.processed
          ? `Processed next queued request ${result.requestId || "unknown request"}.`
          : result?.message || "No queued AI review jobs were available.",
        currentUser,
        requestId: result?.requestId || null,
        jobId: result?.jobId || null,
        metadata: result || {},
      });
      await refreshRequestsAndEngineState();
      setBackendMessage("Legal Affair Engine processed the next queued request.");
    } catch (error) {
      const message = describeAppError(error);
      await createLegalAffairEngineEvent({
        eventType: "manual_process_next_failed",
        level: "error",
        message,
        currentUser,
      }).catch(() => {});
      await refreshRequestsAndEngineState();
      setBackendMessage(
        `Legal Affair Engine could not process the next request: ${message}`,
      );
    }
  }

  async function handleQueuePositionChange(request, priorityRequests, nextPosition) {
    if (engineState?.isRunning) {
      setBackendMessage("Stop the Legal Affair Engine before changing queue position.");
      return;
    }

    const currentIndex = priorityRequests.findIndex((item) => item.id === request.id);
    const clampedPosition = Math.max(
      1,
      Math.min(Number(nextPosition) || 1, priorityRequests.length),
    );
    const nextIndex = clampedPosition - 1;
    const reorderedRequests = [...priorityRequests];
    const [movedRequest] = reorderedRequests.splice(currentIndex, 1);
    reorderedRequests.splice(nextIndex, 0, movedRequest);

    await Promise.all(
      reorderedRequests.map((item, index) =>
        updateAiReviewJobQueueOrder(item.aiReviewJob.id, index + 1),
      ),
    );

    await createLegalAffairEngineEvent({
      eventType: "queue_position_changed",
      level: "status",
      message: `${currentUser.name} moved ${request.id} to position #${clampedPosition} in the ${request.priority} priority queue.`,
      currentUser,
      requestId: request.id,
      jobId: request.aiReviewJob?.id || null,
      metadata: { priority: request.priority, position: clampedPosition },
    });

    await refreshRequestsAndEngineState();
    await addAuditLog("Changed Legal Affair Engine queue position", currentUser.name);
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


  async function handleManagerAssignReviewer(requestId, reviewerId) {
    const assignment = await assignReviewerAsManager({ requestId, reviewerId });

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              assignedReviewer: assignment.reviewer_name,
              managerDecision: "Reviewer assigned by Legal Manager",
              status: assignment.request_status,
            }
          : request,
      ),
    );

    await addAuditLog(
      `Assigned reviewer: ${assignment.reviewer_name}`,
      currentUser.name,
      requestId,
    );
  }

  async function handleReviewerRoute(requestId, destination, commentText) {
    const routedRequest = await routeRequestAsReviewer({
      requestId,
      destination,
      commentText,
    });
    const destinationLabel =
      destination === "requester" ? "Requester" : "Legal Manager";

    setRequests((currentRequests) =>
      currentRequests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status: routedRequest.request_status,
              reviewerComments: [
                ...(request.reviewerComments || []),
                {
                  authorName: currentUser.name,
                  authorRole: currentUser.role,
                  text: commentText,
                },
              ],
            }
          : request,
      ),
    );

    await addAuditLog(
      `Sent request to ${destinationLabel}: ${commentText}`,
      currentUser.name,
      requestId,
    );
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
    if (authMode === "reset-password") {
      return (
        <ResetPasswordPage
          onResetPassword={handleResetPassword}
          onShowLogin={() => setAuthMode("login")}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      );
    }

    if (authMode === "forgot-password") {
      return (
        <ForgotPasswordPage
          onRequestReset={handleRequestPasswordReset}
          onShowLogin={() => setAuthMode("login")}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
      );
    }

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
        onShowForgotPassword={() => setAuthMode("forgot-password")}
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
          users={users}
          onAssignReviewer={(reviewerId) =>
            handleManagerAssignReviewer(selectedRequest.id, reviewerId)
          }
          onRouteRequest={(destination, commentText) =>
            handleReviewerRoute(selectedRequest.id, destination, commentText)
          }
        />
      );
    }

    if (currentPage === "reviewers") {
      return (
        <LegalReviewers
          users={users}
          requests={requests}
          activeUserIds={activeUserIds}
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
          activeUserIds={activeUserIds}
          onUpdateUserRole={handleUpdateUserRole}
          onUpdateUserDepartment={handleUpdateUserDepartment}
        />
      );
    }

    if (currentPage === "legal-engine") {
      return (
        <LegalAffairEngine
          requests={requests}
          engineEvents={engineEvents}
          engineState={engineState}
          onToggleRunning={handleEngineRunningChange}
          onProcessNext={handleProcessNextAiReviewJob}
          onQueuePositionChange={handleQueuePositionChange}
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
          onChangePassword={handleChangePassword}
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
