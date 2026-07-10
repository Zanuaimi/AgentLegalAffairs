import { requireSupabase } from "./supabaseClient";

function usernameToDemoEmail(usernameOrEmail) {
  const trimmed = usernameOrEmail.trim();

  if (trimmed.includes("@")) return trimmed;

  // Demo convenience: users can type "reviewer" instead of reviewer@demo.test.
  return `${trimmed}@demo.test`;
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
  const email = usernameToDemoEmail(usernameOrEmail);
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        `Login failed for ${email}. Check that this demo user exists and the password is correct.`,
      ),
    );
  }

  if (!data.user?.id) {
    throw new Error("Supabase login returned no user. Check Auth configuration.");
  }

  return fetchCurrentProfile(data.user.id);
}

export async function registerWithSupabase(formData) {
  const email = formData.email || usernameToDemoEmail(formData.username);
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

  const roleId = formData.role
    .toLowerCase()
    .replaceAll(" ", "_");
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

1. Why convert username to email?
Supabase Auth signs in with email/password. For easy demo typing, "reviewer" becomes "reviewer@demo.test".

2. Where is the password checked?
Supabase Auth checks the password securely. React never stores the real password after submitting the form.

3. Why fetch profile after login?
Auth knows who the user is, but our app needs role and department from public.profiles.
*/
