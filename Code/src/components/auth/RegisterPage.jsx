import { useState } from "react";
import { getReadableErrorMessage } from "../../utils/errorMessage";
import InfoButton from "../common/InfoButton";

const prefixOptions = ["None", "Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,32}$/;

function RegisterPage({
  onRegister,
  onShowLogin,
  theme,
  onToggleTheme,
  backendMessage,
}) {
  // One object stores all registration form fields together.
  const [formData, setFormData] = useState({
    prefix: "None",
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Requester",
    department: "Legal Affairs",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  function inputClass(fieldName) {
    return `w-full rounded-lg border px-4 py-3 ${
      fieldErrors[fieldName] ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-300"
    }`;
  }

  function updateField(fieldName, value) {
    // The spread operator (...) copies the old object, then updates one field.
    setFormData({ ...formData, [fieldName]: value });
    setFieldErrors((current) => ({ ...current, [fieldName]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    if (!USERNAME_PATTERN.test(formData.username.trim())) {
      const message = "Username must use only letters, numbers, or underscores. Spaces, dots, and hyphens are not allowed.";
      setFieldErrors({ username: message });
      setErrorMessage(message);
      return;
    }

    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      const message = "Enter an email in the format name@example.com.";
      setFieldErrors({ email: message });
      setErrorMessage(message);
      return;
    }

    if (formData.password.length < 6) {
      const message = "Password must contain at least 6 characters.";
      setFieldErrors({ password: message });
      setErrorMessage(message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const message = "Password and confirmation password must match.";
      setFieldErrors({ password: message, confirmPassword: message });
      setErrorMessage(message);
      return;
    }

    setIsLoading(true);

    try {
      await onRegister(formData);
    } catch (error) {
      const readableError = getReadableErrorMessage(
        error,
        "Could not create the account. Please try again.",
      );
      const normalizedError = readableError.toLowerCase();
      const nextFieldErrors = {};

      if (normalizedError.includes("email")) {
        nextFieldErrors.email = "Check this email address or use a different one.";
      }
      if (normalizedError.includes("username")) {
        nextFieldErrors.username = "Choose a different username.";
      }
      if (normalizedError.includes("password")) {
        nextFieldErrors.password = "Check the password requirements.";
      }

      if (normalizedError.includes("email") && normalizedError.includes("invalid")) {
        setErrorMessage(
          "Supabase rejected this email address. Use a normal address such as reviewer@example.com, or check your Supabase Auth email settings.",
        );
      } else {
        setErrorMessage(readableError);
      }
      setFieldErrors(nextFieldErrors);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
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
          <h1 className="text-3xl font-bold text-slate-900 mt-2">Register</h1>
          <p className="text-slate-500 mt-2">
            Create a Supabase Auth account and app profile.
          </p>
        </div>

        {backendMessage && (
          <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
            {backendMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Prefix
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              value={formData.prefix}
              onChange={(event) => updateField("prefix", event.target.value)}
            >
              {prefixOptions.map((prefix) => (
                <option key={prefix} value={prefix}>
                  {prefix}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <InfoButton
                label="Username requirements"
                description="Use 3 to 32 letters, numbers, or underscores only. Spaces, dots, and hyphens are not allowed. Example: legal_reviewer"
              />
            </div>
            <input
              className={inputClass("username")}
              value={formData.username}
              onChange={(event) => updateField("username", event.target.value)}
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9_]{3,32}"
              required
            />
            {fieldErrors.username && (
              <p className="mt-1 text-xs font-semibold text-red-700">
                {fieldErrors.username}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="mb-1 flex items-center gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <InfoButton
                label="Accepted email format"
                description="Use a normal email format with text before @, a domain after @, and a domain ending such as .com, .edu, or .org. Example: reviewer@example.com"
              />
            </div>
            <input
              className={inputClass("email")}
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs font-semibold text-red-700">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <InfoButton
                label="Password requirements"
                description="Use at least 6 characters. You may use letters, numbers, spaces, and special characters."
              />
            </div>
            <input
              className={inputClass("password")}
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs font-semibold text-red-700">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1 flex items-center gap-2">
              <label className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <InfoButton
                label="Confirm password"
                description="Type the same password again. This helps catch a typing mistake before the account is created."
              />
            </div>
            <input
              className={inputClass("confirmPassword")}
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={formData.confirmPassword}
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
              aria-invalid={Boolean(fieldErrors.confirmPassword)}
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-xs font-semibold text-red-700">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Role</p>
            <p className="mt-1 font-semibold text-blue-800">Requester</p>
            <p className="mt-1 text-xs text-slate-600">
              Legal Affairs staff roles are assigned later by an administrator.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">Department</p>
            <p className="mt-1 font-semibold text-slate-900">Legal Affairs</p>
            <p className="mt-1 text-xs text-slate-600">
              Public requester accounts are created in Legal Affairs by default.
            </p>
          </div>

          {errorMessage && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 mt-2">
            <button
              className="flex-1 bg-blue-700 text-white rounded-lg py-3 font-semibold hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
            <button
              className="flex-1 border border-slate-300 rounded-lg py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
              type="button"
              onClick={onShowLogin}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;

/*
BEGINNER DOCUMENTATION:

1. Why store form data in an object?
A registration form has many fields. An object keeps related values together in one state variable.

2. What is the spread operator (...)?
It copies existing values. Example: { ...formData, fullName: 'New Name' } keeps old fields and changes fullName.

3. What is map?
map loops through an array and returns new JSX for every item. We use it to create dropdown options.

4. What is a select tag?
<select> creates a dropdown list. <option> creates each choice inside the dropdown.

5. Why is the role shown as Requester instead of a dropdown?
A public visitor should only be able to create a Requester account. Legal staff roles have more access to confidential records, so an Admin User assigns those roles after account verification.

6. Why are there info buttons beside some labels?
They provide a short explanation of accepted email, username, and password input without making the form visually crowded.

7. Why is the theme button on the registration page?
It lets the user switch between light mode and dark mode before creating an account.

8. Why is the theme button icon-only?
The icon keeps the UI compact. aria-label and title still explain the button for accessibility and hover help.
*/
