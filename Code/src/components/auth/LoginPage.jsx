import { useState } from "react";

function LoginPage({ onLogin, onShowRegister, theme, onToggleTheme }) {
  // State stores what the user types into the login form.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    // preventDefault stops the browser from refreshing the page after form submit.
    event.preventDefault();

    // BACKEND TODO: POST /api/auth/login
    // In the real system, send username and password to the backend.
    // For Version 1 frontend-only work, this is a dummy login and accepts any input.

    onLogin({
      name: username || "Demo User",
      role: "Requester",
      department: "HR",
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-end mb-4">
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
        </div>

        <div className="mb-8 text-center">
          <p className="text-sm font-semibold text-blue-700">
            Legal Affairs Platform
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Login</h1>
          <p className="text-slate-500 mt-2">
            Frontend demo login. Any username/password works.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Enter any username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Enter any password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button
            className="w-full bg-blue-700 text-white rounded-lg py-3 font-semibold hover:bg-blue-800 transition"
            type="submit"
          >
            Login to Dashboard
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          New user?{" "}
          <button
            className="text-blue-700 font-semibold hover:underline"
            type="button"
            onClick={onShowRegister}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;

/*
BEGINNER DOCUMENTATION:

1. What is a React component?
A component is a reusable piece of UI. LoginPage is a component because it returns JSX for the login screen.

2. What is useState?
useState is a React Hook. It lets the component remember changing values, such as username and password.

3. What is an event?
An event is something the user does, such as typing, clicking, or submitting a form.

4. What is onChange?
onChange runs when the user types into an input. We use it to update React state.

5. What is a prop?
Props are values/functions passed from a parent component. onLogin, onShowRegister, theme, and onToggleTheme come from App.jsx.

6. Why is the theme button on the login page?
It lets the user switch between light mode and dark mode before logging in.

7. Why is the theme button icon-only?
The icon keeps the UI compact. aria-label and title still explain the button for accessibility and hover help.
*/
