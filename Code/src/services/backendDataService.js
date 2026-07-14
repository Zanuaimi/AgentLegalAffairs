import { requireSupabase } from "./supabaseClient";

function formatDateTime(value) {
  if (!value) return "Not recorded";

  return new Date(value).toLocaleString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapProfile(row) {
  return {
    id: row.id,
    name: row.full_name,
    username: row.username,
    prefix: row.prefix,
    email: row.email,
    role: row.roles?.name || row.role_name || row.role_id,
    department:
      row.departments?.name || row.department_name || row.department_id,
    status: row.status,
  };
}

function mapChecklistRows(rows) {
  return [...rows]
    .sort(
      (a, b) =>
        (a.legal_review_criteria?.sort_order || 0) -
        (b.legal_review_criteria?.sort_order || 0),
    )
    .map((row) => ({
      id: row.id,
      criteria:
        row.legal_review_criteria?.criteria || row.criteria || "Checklist item",
      page: row.page,
      checked: row.checked,
      note: row.note,
    }));
}

function mapSuggestionRows(rows) {
  return rows.map((row) => ({
    page: row.page,
    type: row.suggestion_type,
    text: row.suggestion_text,
  }));
}

function mapAiReviewJob(row) {
  if (!row) return null;

  return {
    id: row.id,
    status: row.status,
    queuePosition: row.queue_position,
    priorityQueuePosition: row.priority_queue_position,
    queueOrder: row.queue_order,
    attemptCount: row.attempt_count,
    lastError: row.last_error,
    currentStep: row.current_step,
    operationalTrace: row.operational_trace || [],
    lockedAtRaw: row.locked_at,
    startedAtRaw: row.started_at,
    completedAtRaw: row.completed_at,
    createdAtRaw: row.created_at,
    updatedAtRaw: row.updated_at,
    lockedAt: formatDateTime(row.locked_at),
    startedAt: formatDateTime(row.started_at),
    completedAt: formatDateTime(row.completed_at),
    createdAt: formatDateTime(row.created_at),
    updatedAt: formatDateTime(row.updated_at),
  };
}

function mapRequest(row, relatedData) {
  const documents = (relatedData.documentsByRequest[row.id] || []).map(
    (document) => ({
      id: document.id,
      name: document.file_name,
      type: document.mime_type,
      url: document.public_url || document.storage_path || "",
      checklist: mapChecklistRows(
        relatedData.checklistByDocument[document.id] || [],
      ),
      aiSuggestions: mapSuggestionRows(
        relatedData.suggestionsByDocument[document.id] || [],
      ),
    }),
  );

  const comments = (relatedData.commentsByRequest[row.id] || []).map(
    (comment) => ({
      authorName: comment.profiles?.full_name || "User",
      authorRole: comment.profiles?.roles?.name || "User",
      reviewerName: comment.profiles?.full_name || "User",
      text: comment.comment_text,
    }),
  );

  return {
    id: row.id,
    title: row.title,
    categoryCode: row.category_code,
    categoryName: row.category_name,
    department: row.department,
    requester: row.requester,
    requesterUsername: row.requester_username,
    assignedReviewer: row.assigned_reviewer || "Not Assigned",
    priority: row.priority,
    riskLevel: row.risk_level,
    status: row.status,
    deadline: row.deadline || "No deadline selected",
    submittedAt: formatDateTime(row.submitted_at),
    description: row.description,
    documents,
    aiSummary: row.ai_summary,
    aiReviewResult: row.ai_review_result,
    aiReviewJob: mapAiReviewJob(relatedData.aiJobsByRequest[row.id]?.[0]),
    managerDecision: row.manager_decision,
    departmentDecision: row.department_decision,
    reviewerComments: comments,
  };
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const groupKey = row[key];
    groups[groupKey] = groups[groupKey] || [];
    groups[groupKey].push(row);
    return groups;
  }, {});
}

export async function checkBackendConnection() {
  const client = requireSupabase();
  const { error } = await client.from("roles").select("id").limit(1);

  if (error) throw error;
  return true;
}

export async function fetchBackendUsers() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select(
      "id, username, full_name, email, prefix, status, roles(name), departments(name)",
    )
    .order("full_name");

  if (error) throw error;
  return data.map(mapProfile);
}

export async function fetchBackendAuditLogs() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("audit_logs")
    .select("id, request_id, action, actor_name, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    requestId: row.request_id || "System",
    action: row.action,
    user: row.actor_name,
    time: formatDateTime(row.created_at),
  }));
}

export async function fetchBackendRequests() {
  const client = requireSupabase();
  const { data: requestRows, error: requestError } = await client
    .from("legal_requests_dashboard")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (requestError) throw requestError;

  const requestIds = requestRows.map((request) => request.id);

  if (requestIds.length === 0) return [];

  const [
    documentsResult,
    checklistResult,
    suggestionsResult,
    commentsResult,
    aiJobsResult,
    activeQueueResult,
  ] = await Promise.all([
    client.from("request_documents").select("*").in("request_id", requestIds),
    client
      .from("request_checklist_items")
      .select("*, legal_review_criteria(criteria, sort_order)")
      .in("request_id", requestIds),
    client
      .from("document_ai_suggestions")
      .select("*, request_documents!inner(request_id)")
      .in("request_documents.request_id", requestIds),
    client
      .from("reviewer_comments")
      .select("*, profiles(full_name, roles(name))")
      .in("request_id", requestIds)
      .order("created_at", { ascending: true }),
    client
      .from("ai_review_jobs")
      .select("*")
      .in("request_id", requestIds)
      .order("created_at", { ascending: false }),
    client
      .from("ai_review_jobs")
      .select("id, request_id, status, queue_order, created_at")
      .in("status", ["queued", "processing"])
      .order("created_at", { ascending: true }),
  ]);

  if (documentsResult.error) throw documentsResult.error;
  if (checklistResult.error) throw checklistResult.error;
  if (suggestionsResult.error) throw suggestionsResult.error;
  if (commentsResult.error) throw commentsResult.error;
  if (aiJobsResult.error) throw aiJobsResult.error;
  if (activeQueueResult.error) throw activeQueueResult.error;

  const requestById = Object.fromEntries(
    requestRows.map((request) => [request.id, request]),
  );
  const priorityRank = { Urgent: 1, High: 2, Medium: 3, Low: 4 };
  const activeQueueRows = [...activeQueueResult.data].sort((a, b) => {
    const requestA = requestById[a.request_id] || {};
    const requestB = requestById[b.request_id] || {};
    return (
      (priorityRank[requestA.priority] || 5) -
        (priorityRank[requestB.priority] || 5) ||
      (a.queue_order || 0) - (b.queue_order || 0) ||
      new Date(a.created_at) - new Date(b.created_at)
    );
  });

  const queuePositionByJobId = activeQueueRows.reduce((positions, job, index) => {
    positions[job.id] = index + 1;
    return positions;
  }, {});

  const priorityQueuePositionByJobId = activeQueueRows.reduce(
    (positions, job) => {
      const priority = requestById[job.request_id]?.priority || "Other";
      positions.counts[priority] = (positions.counts[priority] || 0) + 1;
      positions.byJobId[job.id] = positions.counts[priority];
      return positions;
    },
    { counts: {}, byJobId: {} },
  ).byJobId;

  const aiJobsWithPositions = aiJobsResult.data.map((job) => ({
    ...job,
    queue_position: queuePositionByJobId[job.id] || null,
    priority_queue_position: priorityQueuePositionByJobId[job.id] || null,
  }));

  // PDFs are stored in a private bucket. A signed URL expires after 15 minutes,
  // so a copied browser URL cannot provide long-term access to a legal document.
  const documentsWithSignedUrls = await Promise.all(
    documentsResult.data.map(async (document) => {
      if (!document.storage_path) return document;

      const { data, error } = await client.storage
        .from("legal-documents")
        .createSignedUrl(document.storage_path, 15 * 60);

      if (error) throw error;

      return { ...document, public_url: data.signedUrl };
    }),
  );

  const documentsByRequest = groupBy(documentsWithSignedUrls, "request_id");
  const checklistByDocument = groupBy(checklistResult.data, "document_id");
  const suggestionsByDocument = groupBy(suggestionsResult.data, "document_id");
  const commentsByRequest = groupBy(commentsResult.data, "request_id");
  const aiJobsByRequest = groupBy(aiJobsWithPositions, "request_id");

  return requestRows.map((row) =>
    mapRequest(row, {
      documentsByRequest,
      checklistByDocument,
      suggestionsByDocument,
      commentsByRequest,
      aiJobsByRequest,
    }),
  );
}

export async function createBackendRequest(newRequest, currentUser) {
  const client = requireSupabase();
  const requestRow = {
    id: newRequest.id,
    title: newRequest.title,
    description: newRequest.description,
    requester_id: currentUser.id,
    department_id: newRequest.department.toLowerCase().replaceAll(" ", "_"),
    category_code: newRequest.categoryCode,
    priority: newRequest.priority,
    risk_level: newRequest.riskLevel,
    status: newRequest.status,
    deadline:
      newRequest.deadline === "No deadline selected"
        ? null
        : newRequest.deadline,
    ai_summary: newRequest.aiSummary,
    ai_review_result: newRequest.aiReviewResult,
  };

  const { error: requestError } = await client
    .from("legal_requests")
    .insert(requestRow);

  if (requestError) throw requestError;

  const firstDocument = newRequest.documents[0];
  let storagePath = null;
  let publicUrl = null;

  if (newRequest.uploadFile) {
    storagePath = `${newRequest.id}/${Date.now()}-${newRequest.uploadFile.name}`;

    const { error: uploadError } = await client.storage
      .from("legal-documents")
      .upload(storagePath, newRequest.uploadFile, {
        contentType: newRequest.uploadFile.type || "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

  }

  const { data: documentRow, error: documentError } = await client
    .from("request_documents")
    .insert({
      request_id: newRequest.id,
      file_name: firstDocument.name,
      mime_type: firstDocument.type,
      storage_path: storagePath,
      public_url: publicUrl,
    })
    .select("id")
    .single();

  if (documentError) throw documentError;

  const { data: criteriaRows, error: criteriaError } = await client
    .from("legal_review_criteria")
    .select("id, criteria");

  if (criteriaError) throw criteriaError;

  const checklistRows = firstDocument.checklist
    .map((item) => ({
      request_id: newRequest.id,
      document_id: documentRow.id,
      criteria_id: criteriaRows.find(
        (criteria) => criteria.criteria === item.criteria,
      )?.id,
      page: String(item.page),
      checked: item.checked,
      note: item.note,
    }))
    .filter((row) => row.criteria_id);

  if (checklistRows.length > 0) {
    const { error: checklistError } = await client
      .from("request_checklist_items")
      .insert(checklistRows);

    if (checklistError) throw checklistError;
  }

  if (newRequest.aiReviewResult) {
    const suggestionRows = firstDocument.aiSuggestions.map((suggestion) => ({
      document_id: documentRow.id,
      page: String(suggestion.page),
      suggestion_type: suggestion.type,
      suggestion_text: suggestion.text,
    }));

    if (suggestionRows.length > 0) {
      const { error: suggestionError } = await client
        .from("document_ai_suggestions")
        .insert(suggestionRows);

      if (suggestionError) throw suggestionError;
    }
  }

  const { error: queueError } = await client.from("ai_review_jobs").insert({
    request_id: newRequest.id,
    document_id: documentRow.id,
    status: "queued",
    queue_order: Date.now(),
    current_step: "Queued for AI review",
    operational_trace: [
      {
        at: new Date().toISOString(),
        step: "queued",
        message:
          "Request saved and PDF uploaded. AI review is waiting in the priority queue.",
      },
    ],
  });

  if (queueError) throw queueError;

  const { data: assignmentRows, error: assignmentError } = await client.rpc(
    "auto_assign_legal_reviewer",
    { p_request_id: newRequest.id },
  );

  if (assignmentError) throw assignmentError;

  const assignment = assignmentRows?.[0];
  return {
    ...newRequest,
    assignedReviewer: assignment?.reviewer_name || "Not Assigned",
    status: assignment ? "Assigned to Legal Reviewer" : newRequest.status,
  };
}


export async function assignReviewerAsManager({ requestId, reviewerId }) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("assign_reviewer_as_manager", {
    p_request_id: requestId,
    p_reviewer_id: reviewerId,
  });

  if (error) throw error;

  return data?.[0];
}

export async function routeRequestAsReviewer({
  requestId,
  destination,
  commentText,
}) {
  const client = requireSupabase();
  const { data, error } = await client.rpc("route_request_as_reviewer", {
    p_request_id: requestId,
    p_destination: destination,
    p_comment_text: commentText,
  });

  if (error) throw error;

  return data?.[0];
}

export async function fetchLegalAffairEngineEvents() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ai_engine_events")
    .select("id, event_type, level, message, request_id, job_id, metadata, created_at, profiles:actor_id(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw error;

  return data.map((event) => ({
    id: event.id,
    eventType: event.event_type,
    level: event.level,
    message: event.message,
    requestId: event.request_id,
    jobId: event.job_id,
    metadata: event.metadata || {},
    actorName: event.profiles?.full_name || "System",
    createdAt: event.created_at,
    displayTime: formatDateTime(event.created_at),
  }));
}

export async function createLegalAffairEngineEvent({
  eventType,
  level = "info",
  message,
  currentUser,
  requestId = null,
  jobId = null,
  metadata = {},
}) {
  const client = requireSupabase();
  const { error } = await client.from("ai_engine_events").insert({
    event_type: eventType,
    level,
    message,
    request_id: requestId,
    job_id: jobId,
    actor_id: currentUser?.id || null,
    metadata,
  });

  if (error) throw error;
}

export async function fetchLegalAffairEngineState() {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ai_engine_control")
    .select("id, is_running, updated_at, profiles:updated_by(full_name)")
    .eq("id", "legal_affair_engine")
    .single();

  if (error) throw error;

  return {
    isRunning: data.is_running,
    updatedAt: formatDateTime(data.updated_at),
    updatedBy: data.profiles?.full_name || "System",
  };
}

export async function setLegalAffairEngineRunning(isRunning, currentUser) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("ai_engine_control")
    .update({ is_running: isRunning, updated_by: currentUser.id })
    .eq("id", "legal_affair_engine")
    .select("id, is_running, updated_at, profiles:updated_by(full_name)")
    .single();

  if (error) throw error;

  return {
    isRunning: data.is_running,
    updatedAt: formatDateTime(data.updated_at),
    updatedBy: data.profiles?.full_name || currentUser.name,
  };
}

export async function updateAiReviewJobQueueOrder(jobId, queueOrder) {
  const client = requireSupabase();
  const { error } = await client
    .from("ai_review_jobs")
    .update({
      queue_order: Number(queueOrder),
      current_step: "Queue order adjusted by admin",
    })
    .eq("id", jobId)
    .eq("status", "queued");

  if (error) throw error;
}

export async function createBackendRequestComment({
  requestId,
  currentUser,
  commentText,
}) {
  const client = requireSupabase();
  const { error } = await client.from("reviewer_comments").insert({
    request_id: requestId,
    reviewer_id: currentUser.id,
    comment_text: commentText,
  });

  if (error) throw error;
}

export async function createBackendAuditLog(
  action,
  currentUser,
  requestId = "System",
) {
  const client = requireSupabase();
  const { error } = await client.from("audit_logs").insert({
    request_id: requestId === "System" ? null : requestId,
    action,
    actor_id: currentUser?.id || null,
    actor_name: currentUser?.name || "System",
  });

  if (error) throw error;
}

function statusForManagerDecision(decision) {
  if (decision === "Closed by Legal Manager") return "Closed";
  if (decision === "Response Approved by Legal Manager") return "Approved";
  if (decision === "Escalated by Legal Manager") return "Under Review";
  if (decision === "Reviewer Assignment Started") return "Assigned to Legal Reviewer";
  return "Under Review";
}

function statusForDepartmentDecision(decision) {
  if (decision === "Department Approved") return "Sent for Internal Approval";
  if (decision === "Department Requested Revision") return "Returned for Revision";
  return "Under Review";
}

export async function createBackendManagerAction({
  requestId,
  currentUser,
  decision,
}) {
  const client = requireSupabase();
  const status = statusForManagerDecision(decision);

  const { error: actionError } = await client.from("manager_actions").insert({
    request_id: requestId,
    manager_id: currentUser.id,
    action: decision,
  });

  if (actionError) throw actionError;

  const { error: requestError } = await client
    .from("legal_requests")
    .update({ manager_decision: decision, status })
    .eq("id", requestId);

  if (requestError) throw requestError;

  return { managerDecision: decision, status };
}

export async function createBackendDepartmentApproval({
  requestId,
  currentUser,
  decision,
  commentText,
}) {
  const client = requireSupabase();
  const status = statusForDepartmentDecision(decision);

  const { error: approvalError } = await client
    .from("department_approvals")
    .insert({
      request_id: requestId,
      approver_id: currentUser.id,
      decision,
      comment_text: commentText || "",
    });

  if (approvalError) throw approvalError;

  const { error: requestError } = await client
    .from("legal_requests")
    .update({ department_decision: decision, status })
    .eq("id", requestId);

  if (requestError) throw requestError;

  return { departmentDecision: decision, status };
}

export async function updateBackendChecklistItem({ checklistItemId, checked }) {
  const client = requireSupabase();
  const { error } = await client
    .from("request_checklist_items")
    .update({ checked })
    .eq("id", checklistItemId);

  if (error) throw error;
}

async function lookupIdByName(client, tableName, name) {
  const { data, error } = await client
    .from(tableName)
    .select("id")
    .eq("name", name)
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateBackendUserRole({ userId, roleName }) {
  const client = requireSupabase();
  const roleId = await lookupIdByName(client, "roles", roleName);
  const { error } = await client
    .from("profiles")
    .update({ role_id: roleId })
    .eq("id", userId);

  if (error) throw error;
}

export async function updateBackendUserDepartment({ userId, departmentName }) {
  const client = requireSupabase();
  const departmentId = await lookupIdByName(client, "departments", departmentName);
  const { error } = await client
    .from("profiles")
    .update({ department_id: departmentId })
    .eq("id", userId);

  if (error) throw error;
}

/*
BEGINNER DOCUMENTATION:

1. Why map database rows?
The old frontend used camelCase mock objects. Supabase returns database-style snake_case rows. Mapping lets us keep the UI mostly unchanged.

2. Why are checklist items separate rows now?
A checklist belongs to a request/document. Storing each item as a row makes it easier for Legal Reviewers to update one item at a time.

3. Does this replace every mock interaction?
Most core request workflow actions now persist to Supabase: requests, comments, checklist updates, manager decisions, department approvals, audit logs, and admin profile changes.
*/
