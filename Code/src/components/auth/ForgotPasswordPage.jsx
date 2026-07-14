import { useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordPage({ onRequestReset, onShowLogin, theme, onToggleTheme }) {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage("Enter a valid email address, such as name@example.edu.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await onRequestReset(trimmedEmail);
      setSuccessMessage(
        "If an account exists for this email, a password-reset link has been sent.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not request a password reset.",
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

        <h1 className="mt-5 text-3xl font-bold text-slate-900">Reset password</h1>
        <p className="mt-2 text-slate-500">
          Enter your account email. We will send a secure password-reset link.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.edu"
              required
            />
          </label>

          {errorMessage && <p className="text-sm font-semibold text-red-700">{errorMessage}</p>}
          {successMessage && <p className="text-sm font-semibold text-green-700">{successMessage}</p>}

          <button
            className="w-full rounded-lg bg-blue-700 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending link..." : "Send reset link"}
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

export default ForgotPasswordPage;

/*
BEGINNER DOCUMENTATION:

1. Why is the same success message shown for every email?
A password-reset screen should not reveal whether an email account exists. That prevents people from using the form to discover registered users.

2. What is type="email"?
It tells the browser to expect an email address and gives mobile users an email-friendly keyboard. JavaScript also checks the email pattern before sending the request.

3. What does preventDefault do?
It stops a form submit from refreshing the whole page, so React can call Supabase and show success or error text in the same screen.
*/
