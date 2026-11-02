"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export type FormState = { error?: string } | undefined;

const credentials = z.object({
  email: z.email().max(320),
  password: z.string().min(1).max(200),
});

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  // One message for every failure, so the form never reveals which part was wrong.
  const failure = { error: "That email and password don’t match. Check them and try again." };
  if (!parsed.success) return failure;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.status === 429) {
      return { error: "Too many sign-in attempts. Wait a few minutes, then try again." };
    }
    return failure;
  }

  if (data.user.id !== process.env.ADMIN_USER_ID) {
    await supabase.auth.signOut();
    return failure;
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") redirect("/login/mfa");

  redirect("/admin");
}

export async function verifyMfa(_prev: FormState, formData: FormData): Promise<FormState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (listError || !factor) redirect("/admin");

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: "That code didn’t work. Codes change every 30 seconds, so try the current one." };

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
