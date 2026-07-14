import { useState } from "react";
import kuLogo from "../../../Assets/KULogo.png";
import { getReadableErrorMessage } from "../../utils/errorMessage";

function LoginPage({
  onLogin,
  onShowRegister,
  onShowForgotPassword,
  theme,
  onToggleTheme,
  backendMessage,
}) {
  // State stores what the user types into the login form.
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // Demo credentials are local-development only. Hosted Supabase projects use
  // real accounts created through the registration flow or by an administrator.
  const showDemoAccounts = import.meta.env.DEV;

  async function handleSubmit(event) {
    // preventDefault stops the browser from refreshing the page after form submit.
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      await onLogin({ username, password });
    } catch (error) {
      setErrorMessage(
        getReadableErrorMessage(
          error,
          "Login failed. Check Supabase setup, .env.local, and seeded users. Open the browser console for the full error object.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
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
          <img
            className="mx-auto h-20 w-40 rounded-2xl border border-slate-200 bg-white object-contain p-4 shadow-sm"
            src={kuLogo}
            alt="Khalifa University logo"
          />
          <p className="text-sm font-semibold text-blue-700 mt-4">
            Legal Affairs Platform
          </p>
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Login</h1>
          <p className="text-slate-500 mt-2">
            {showDemoAccounts
              ? "Login with Supabase Auth. Demo users are listed below."
              : "Login with your Legal Affairs account."}
          </p>
        </div>

        {backendMessage && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            {backendMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username or Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder={
                showDemoAccounts
                  ? "Example: requester, reviewer, or an email"
                  : "Enter your username or email"
              }
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={254}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              Enter either your application username or your account email address.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder={
                showDemoAccounts ? "Demo password: password123" : "Enter your password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={128}
              required
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            className="w-full bg-blue-700 text-white rounded-lg py-3 font-semibold hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>

        <button
          className="mt-4 w-full text-sm font-semibold text-blue-700 hover:underline"
          type="button"
          onClick={onShowForgotPassword}
        >
          Forgot password?
        </button>

        {showDemoAccounts && (
          <div className="mt-6 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-bold text-slate-900">Easy local demo accounts</p>
            <p>requester / password123</p>
            <p>reviewer / password123</p>
            <p>manager / password123</p>
            <p>approver / password123</p>
            <p>admin / password123</p>
            <p>owner / password123</p>
          </div>
        )}

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

6. Why does onLogin use username and password now?
App.jsx connects this form to Supabase Auth. The login page collects input, and App.jsx decides how to authenticate.

7. Why is the theme button on the login page?
It lets the user switch between light mode and dark mode before logging in.

8. Why is the theme button icon-only?
The icon keeps the UI compact. aria-label and title still explain the button for accessibility and hover help.
*/
