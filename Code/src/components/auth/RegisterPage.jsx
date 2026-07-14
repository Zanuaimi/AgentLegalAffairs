import { useState } from "react";
import { getReadableErrorMessage } from "../../utils/errorMessage";

const prefixOptions = ["None", "Mr.", "Ms.", "Mrs.", "Dr.", "Prof."];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [isLoading, setIsLoading] = useState(false);

  function updateField(fieldName, value) {
    // The spread operator (...) copies the old object, then updates one field.
    setFormData({ ...formData, [fieldName]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");

    if (!EMAIL_PATTERN.test(formData.email.trim())) {
      setErrorMessage(
        "Enter a valid email address with text before and after @, plus a domain extension such as .edu.",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Password and confirm password must match.");
      return;
    }

    setIsLoading(true);

    try {
      await onRegister(formData);
    } catch (error) {
      setErrorMessage(
        getReadableErrorMessage(
          error,
          "Registration failed. Check Supabase setup. Open the browser console for the full error object.",
        ),
      );
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Username
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              value={formData.username}
              onChange={(event) => updateField("username", event.target.value)}
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9._-]{3,32}"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              type="password"
              value={formData.password}
              onChange={(event) => updateField("password", event.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm Password
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-4 py-3"
              type="password"
              value={formData.confirmPassword}
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
            />
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

6. Why is the theme button on the registration page?
It lets the user switch between light mode and dark mode before creating an account.

7. Why is the theme button icon-only?
The icon keeps the UI compact. aria-label and title still explain the button for accessibility and hover help.
*/
