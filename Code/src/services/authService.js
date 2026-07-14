import { requireSupabase } from "./supabaseClient";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,32}$/;

export function getEmailValidationError(email) {
  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return "Enter a valid email address, such as name@example.edu.";
  }

  return "";
}

export function getUsernameValidationError(username) {
  if (!USERNAME_PATTERN.test(username)) {
    return "Username must be 3–32 characters and use only letters, numbers, dots, hyphens, or underscores.";
  }

  return "";
}

async function resolveLoginEmail(client, usernameOrEmail) {
  const identifier = usernameOrEmail.trim();

  if (identifier.includes("@")) {
    const emailError = getEmailValidationError(identifier);
    if (emailError) throw new Error("Invalid login credentials");
    return identifier.toLowerCase();
  }

  if (getUsernameValidationError(identifier)) {
    throw new Error("Invalid login credentials");
  }

  // Local seeded demo accounts use predictable demo.test email addresses.
  if (import.meta.env.DEV) return `${identifier}@demo.test`;

  const { data, error } = await client.rpc("resolve_login_email", {
    p_username: identifier,
  });

  if (error || !data) {
    throw new Error("Invalid login credentials");
  }

  return data;
}

export function getPasswordValidationError(password) {
  if (password.length < 12) {
    return "Use at least 12 characters for your password.";
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return "Use at least one uppercase letter, lowercase letter, and number.";
  }

  return "";
}

function isUsefulErrorText(value) {
  return (
    typeof value === "string" &&
    value.trim() !== "" &&
    value.trim() !== "{}" &&
    value.trim() !== "[object Object]"
  );
}

function getSupabaseErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;

  const candidates = [
    error.message,
    error.error_description,
    error.error,
    error.details,
    error.hint,
  ];

  const readableMessage = candidates.find(isUsefulErrorText);
  if (readableMessage) return readableMessage;

  if (error.name === "AuthRetryableFetchError" || error.name === "TypeError") {
    return "Could not reach Supabase Auth. Start Supabase locally and check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in Code/.env.local.";
  }

  return fallbackMessage;
}

function mapProfileToCurrentUser(profile) {
  return {
    id: profile.id,
    name: profile.full_name,
    username: profile.username,
    email: profile.email,
    prefix: profile.prefix,
    role: profile.roles?.name || profile.role_id,
    department: profile.departments?.name || profile.department_id,
  };
}

export async function fetchCurrentProfile(userId) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("profiles")
    .select("id, username, full_name, email, prefix, role_id, department_id, roles(name), departments(name)")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        `Could not load profile for auth user ${userId}. Did you run supabase db reset?`,
      ),
    );
  }

  return mapProfileToCurrentUser(data);
}

export async function loginWithSupabase(usernameOrEmail, password) {
  const client = requireSupabase();
  const email = await resolveLoginEmail(client, usernameOrEmail);
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        "Invalid login credentials",
      ),
    );
  }

  if (!data.user?.id) {
    throw new Error("Supabase login returned no user. Check Auth configuration.");
  }

  return fetchCurrentProfile(data.user.id);
}

export async function registerWithSupabase(formData) {
  const email = formData.email?.trim().toLowerCase();
  const emailError = getEmailValidationError(email || "");
  const usernameError = getUsernameValidationError(formData.username?.trim() || "");
  const passwordError = getPasswordValidationError(formData.password || "");

  if (emailError) throw new Error(emailError);
  if (usernameError) throw new Error(usernameError);
  if (passwordError) throw new Error(passwordError);
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password: formData.password,
    options: {
      data: {
        username: formData.username,
        full_name: formData.fullName,
      },
    },
  });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        `Registration failed for ${email}. Check Supabase Auth settings.`,
      ),
    );
  }

  if (!data.user?.id) {
    throw new Error("Supabase registration returned no user. Check Auth configuration.");
  }

  // Public registration can create Requester profiles only. Privileged roles
  // are assigned by an administrator after the account is verified.
  const roleId = "requester";
  const departmentId = formData.department
    .toLowerCase()
    .replaceAll(" ", "_");

  const { error: profileError } = await client.from("profiles").insert({
    id: data.user.id,
    username: formData.username,
    full_name: formData.fullName || formData.username,
    email,
    prefix: formData.prefix,
    role_id: roleId,
    department_id: departmentId,
    status: "Active",
  });

  if (profileError) {
    throw new Error(
      getSupabaseErrorMessage(
        profileError,
        "Registration created an auth user but could not create the public profile.",
      ),
    );
  }

  return fetchCurrentProfile(data.user.id);
}

export async function logoutFromSupabase() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Could not log out from Supabase."),
    );
  }
}


export async function requestPasswordReset(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const emailError = getEmailValidationError(normalizedEmail);
  if (emailError) throw new Error(emailError);

  const client = requireSupabase();
  const { error } = await client.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: `${window.location.origin}?password-reset=true`,
  });

  if (error) {
    throw new Error(getSupabaseErrorMessage(error, "Could not send a password-reset email."));
  }
}

export async function resetPasswordWithSupabase(newPassword) {
  const passwordError = getPasswordValidationError(newPassword);
  if (passwordError) throw new Error(passwordError);

  const client = requireSupabase();
  const { error: updateError } = await client.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    throw new Error(getSupabaseErrorMessage(updateError, "Could not update the password."));
  }

  const { error: signOutError } = await client.auth.signOut({ scope: "global" });
  if (signOutError) {
    throw new Error("Password was changed, but sessions could not be signed out. Contact an administrator.");
  }
}

export async function changePasswordWithSupabase({
  email,
  currentPassword,
  newPassword,
}) {
  const passwordError = getPasswordValidationError(newPassword);
  if (passwordError) throw new Error(passwordError);

  const client = requireSupabase();
  const { error: verificationError } = await client.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verificationError) {
    throw new Error("Current password is incorrect.");
  }

  await resetPasswordWithSupabase(newPassword);
}

export async function getExistingSupabaseSessionUser() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(error, "Could not read Supabase session."),
    );
  }

  if (!data.session?.user) return null;

  return fetchCurrentProfile(data.session.user.id);
}

/*
BEGINNER DOCUMENTATION:

1. Why resolve a username to an email?
Supabase Auth signs in with email/password, while this app also stores a unique username in the profile. The login flow looks up an exact username, then sends its email to Supabase Auth. Typing an email skips that lookup.

2. Where is the password checked?
Supabase Auth checks the password securely. React never stores the real password after submitting the form.

3. Why fetch profile after login?
Auth knows who the user is, but our app needs role and department from public.profiles.
*/
