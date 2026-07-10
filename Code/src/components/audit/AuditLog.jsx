function AuditLog({ logs }) {
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Audit Log</h2>
        <p className="text-slate-500 mt-1">Track important actions for confidentiality and accountability.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-b border-slate-100 pb-4 last:border-b-0">
              <div>
                <p className="font-semibold text-slate-900">{log.action}</p>
                <p className="text-sm text-slate-500">Request: {log.requestId} • User: {log.user}</p>
              </div>
              <p className="text-sm text-slate-500">{log.time}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

export default AuditLog;

/*
BEGINNER DOCUMENTATION:

1. What is an audit log?
An audit log records important actions, such as who viewed, edited, uploaded, approved, or closed a request.

2. Why is it important?
Legal documents are confidential. Logs help prove accountability and detect unauthorized activity.

3. What is last:border-b-0?
This is a Tailwind class variant. It removes the bottom border from the last item in the list.
*/
