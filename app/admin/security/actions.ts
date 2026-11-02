"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type EnrollStart = { ok: true; factorId: string; qr: string; secret: string } | { ok: false; error: string };

export async function startEnrollment(): Promise<EnrollStart> {
  const { supabase } = await requireAdmin();

  // Clear any half-finished setup so a fresh QR code can be issued.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}`,
  });
  if (error || !data) return { ok: false, error: "Setup couldn’t start. Try again in a moment." };

  return { ok: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export type ConfirmState = { ok?: boolean; error?: string } | undefined;

export async function confirmEnrollment(_prev: ConfirmState, formData: FormData): Promise<ConfirmState> {
  const { supabase } = await requireAdmin();
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code from your authenticator app." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { error: "That code didn’t work. Enter the code currently shown in the app." };

  revalidatePath("/admin/security");
  return { ok: true };
}

export async function removeFactor(formData: FormData) {
  // requireAdmin already insists on a verified second factor when one exists,
  // so only someone who passed the code check can remove it.
  const { supabase } = await requireAdmin();
  const factorId = String(formData.get("factorId") ?? "");
  await supabase.auth.mfa.unenroll({ factorId });
  revalidatePath("/admin/security");
}
