import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Gatekeeper for every admin page and Server Action.
 *
 * 1. A valid session must exist (verified with Supabase, not just read from a cookie).
 * 2. The user must be the configured admin.
 * 3. If an authenticator app is set up, the session must have passed it (aal2).
 *
 * Row-level security in the database enforces the same rules again, so a bug
 * here still cannot let anyone else write.
 */
export async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId || user.id !== adminId) {
    await supabase.auth.signOut();
    redirect("/login?error=not-authorised");
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    redirect("/login/mfa");
  }

  return { supabase, user };
}
