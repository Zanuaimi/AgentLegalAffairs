import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

class RuntimeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React runtime error:", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-slate-100 p-6 text-slate-900">
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-wide text-red-700">
              Application runtime error
            </p>
            <h1 className="mt-2 text-2xl font-bold">The app could not render.</h1>
            <p className="mt-3 text-slate-600">
              This replaces the blank white screen. Restart Vite, hard-refresh the
              browser, and check the browser console for the full stack trace.
            </p>
            <pre className="mt-4 overflow-auto rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800">
              {this.state.error?.message || String(this.state.error)}
            </pre>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML =
    '<main style="padding: 24px; font-family: sans-serif;"><h1>Application mount error</h1><p>index.html is missing &lt;div id="root"&gt;.</p></main>';
} else {
  // createRoot connects React to the <div id="root"> inside index.html.
  createRoot(rootElement).render(
    <React.StrictMode>
      <RuntimeErrorBoundary>
        <App />
      </RuntimeErrorBoundary>
    </React.StrictMode>,
  );
}

/*
BEGINNER DOCUMENTATION:

1. What is an entry file?
This is the first React file that runs when the app opens.

2. What is import?
import lets this file use code from another file or package.

3. What is <App />?
<App /> is a React component. It is the main component for the whole application.

4. What is React.StrictMode?
StrictMode helps developers find possible problems during development. It does not show anything on screen.
*/
