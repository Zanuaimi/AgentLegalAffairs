function AiSummaryBox({ summary }) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-bold text-blue-950">AI Draft Summary</h3>
          <p className="text-xs uppercase tracking-wide text-blue-700 font-semibold mt-1">Draft only - human legal review required</p>
        </div>
      </div>

      <p className="text-slate-700 mt-4 leading-relaxed">{summary}</p>

      <div className="mt-4 text-sm text-blue-900 bg-white/70 rounded-xl p-3">
        The AI assistant supports Legal Affairs, but it must not provide final approval or make binding decisions.
      </div>

    </div>
  );
}

export default AiSummaryBox;

/*
BEGINNER DOCUMENTATION:

1. Why label AI output as draft?
The document says AI is only a support tool. Legal Affairs must review and approve final decisions.

2. What is a component prop?
summary is a prop. RequestDetails passes the selected request's AI summary into this component.

3. What is reusable UI?
This box can be reused anywhere we need to display an AI-generated draft summary.
*/
