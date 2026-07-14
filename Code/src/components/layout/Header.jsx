import { useState } from "react";
import { getPasswordValidationError } from "../../services/authService";

function getDisplayName(user) {
  // If the prefix is "None" or empty, show only the user's name.
  if (!user.prefix || user.prefix === "None") {
    return user.name;
  }

  return `${user.prefix} ${user.name}`;
}

function Header({
  currentUser,
  onLogout,
  onChangePassword,
  theme,
  onToggleTheme,
}) {
  // showProfileMenu controls the small dropdown under the Profile button.
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // showSettings controls the bigger settings popup.
  const [showSettings, setShowSettings] = useState(false);

  // showEmail controls whether email text is visible or hidden in Settings.
  const [showEmail, setShowEmail] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const displayName = getDisplayName(currentUser);
  const hiddenEmail = currentUser.email ? "••••••••••••••••" : "No email saved";

  function openSettings() {
    setShowSettings(true);
    setShowProfileMenu(false);
  }

  function updatePasswordField(fieldName, value) {
    setPasswordForm({ ...passwordForm, [fieldName]: value });
  }

  async function submitPasswordChange(event) {
    event.preventDefault();
    const validationError = getPasswordValidationError(passwordForm.newPassword);

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation password must match.");
      return;
    }

    setPasswordError("");
    setIsChangingPassword(true);

    try {
      await onChangePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Could not change the password.",
      );
      setIsChangingPassword(false);
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Legal Affairs Platform
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-800">
          Role: {currentUser.role || "Not assigned"}
        </div>

        <div className="relative">
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            Profile ▾
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                onClick={openSettings}
              >
                Settings
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                onClick={onLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Profile Settings
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  {displayName}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Account information loaded from your user profile.
                </p>
              </div>

              <button
                type="button"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 hover:bg-slate-50"
                onClick={() => setShowSettings(false)}
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Full Name
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {currentUser.name}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Username
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {currentUser.username || currentUser.name}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {showEmail
                        ? currentUser.email || "No email saved"
                        : hiddenEmail}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                    onClick={() => setShowEmail(!showEmail)}
                  >
                    {showEmail ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Prefix
                </p>
                <p className="mt-1 font-semibold text-slate-900">
                  {currentUser.prefix || "None"}
                </p>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                  Account security
                </p>
                {!showPasswordForm ? (
                  <button
                    type="button"
                    className="mt-3 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change password
                  </button>
                ) : (
                  <form className="mt-3 space-y-3" onSubmit={submitPasswordChange}>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      type="password"
                      autoComplete="current-password"
                      placeholder="Current password"
                      value={passwordForm.currentPassword}
                      onChange={(event) =>
                        updatePasswordField("currentPassword", event.target.value)
                      }
                      required
                    />
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      type="password"
                      autoComplete="new-password"
                      placeholder="New password"
                      value={passwordForm.newPassword}
                      onChange={(event) =>
                        updatePasswordField("newPassword", event.target.value)
                      }
                      required
                    />
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Confirm new password"
                      value={passwordForm.confirmPassword}
                      onChange={(event) =>
                        updatePasswordField("confirmPassword", event.target.value)
                      }
                      required
                    />
                    <p className="text-xs text-slate-600">
                      At least 12 characters with uppercase, lowercase, and a number.
                    </p>
                    {passwordError && (
                      <p className="text-sm font-semibold text-red-700">{passwordError}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isChangingPassword}
                      >
                        {isChangingPassword ? "Changing password..." : "Confirm password change"}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
                        disabled={isChangingPassword}
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordError("");
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;

/*
BEGINNER DOCUMENTATION:

1. What is a profile menu?
A profile menu is a small dropdown opened from the Profile button. It keeps account actions like Settings and Log out in one place.

2. Why remove the visible Demo User text?
The reviewer asked to remove the user name block from the header. User details now live inside the Settings popup.

3. What is a settings popup?
It is a modal window that appears above the page. Here it shows username, email visibility toggle, and prefix.

4. Why remove the role and department dropdowns?
Now that Supabase Auth is connected, role and department should come from the logged-in user's database profile instead of a demo switcher.

5. Why is the email hidden by default?
Email can be personal information. Hiding it until clicked is a simple privacy-friendly UI pattern.
*/
