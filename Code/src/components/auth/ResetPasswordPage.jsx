import { useState } from "react";
import { getPasswordValidationError } from "../../services/authService";

function ResetPasswordPage({ onResetPassword, onShowLogin, theme, onToggleTheme }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const passwordError = getPasswordValidationError(newPassword);

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation password must match.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onResetPassword(newPassword);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not reset the password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex justify-end">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 text-xl leading-none text-slate-700 hover:bg-slate-50"
            onClick={onToggleTheme}
            aria-label="Toggle light and dark mode"
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>

        <h1 className="mt-5 text-3xl font-bold text-slate-900">Choose a new password</h1>
        <p className="mt-2 text-slate-500">
          Use at least 12 characters, including an uppercase letter, lowercase letter, and number.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            New password
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Confirm new password
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          {errorMessage && <p className="text-sm font-semibold text-red-700">{errorMessage}</p>}

          <button
            className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating password..." : "Update password and sign out"}
          </button>
        </form>

        <button
          className="mt-5 w-full text-sm font-semibold text-blue-700 hover:underline"
          type="button"
          onClick={onShowLogin}
        >
          Back to login
        </button>
      </section>
    </main>
  );
}

export default ResetPasswordPage;

/*
BEGINNER DOCUMENTATION:

1. Why are there two password fields?
The confirmation field catches typing mistakes before the password is saved. Neither value changes the account until the form is submitted.

2. What is autoComplete="new-password"?
It tells password managers that this field creates a replacement password, helping them generate and save a strong one.

3. Why sign out after a reset?
A password reset is a security event. The app invalidates sessions after the update so every browser must authenticate again with the new password.
*/
