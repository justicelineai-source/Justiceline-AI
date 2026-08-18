/**
 * Server-only authentication helpers.
 *
 * Never import this from browser code — it uses the service-role client.
 */
import { createHash, randomInt } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const OTP_TTL_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 5;
/** How long a verified phone stays usable for completing registration. */
export const OTP_VERIFICATION_WINDOW_MINUTES = 20;

export type OtpPurpose = "signup" | "login";

export function hashCode(phone: string, code: string) {
  return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

export function generateOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function findProfileByPhone(phone: string) {
  console.log("Searching phone:", phone);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  console.log("Profile:", data);
  console.log("Error:", error);

  return data;
}
  

export async function findProfileByEmail(email: string) {
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, email, phone, account_status")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  return data;
}

export async function issueOtp(phone: string, purpose: OtpPurpose) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();

  const { error } = await supabaseAdmin.from("phone_otps").insert({
  phone,
  purpose,
  code_hash: hashCode(phone, code),
  expires_at: expiresAt,
});

if (error) {
  console.error("OTP INSERT ERROR:", error);
  throw new Error(error.message);
}

console.log("OTP saved successfully:", code);

return code;

  return code;
}

/** Verifies and consumes the newest unexpired OTP for this phone + purpose. */
export async function consumeOtp(phone: string, code: string, purpose: OtpPurpose) {
  const { data: row } = await supabaseAdmin
    .from("phone_otps")
    .select("id, code_hash, attempts, expires_at, consumed_at")
    .eq("phone", phone)
    .eq("purpose", purpose)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!row) return { ok: false as const, error: "Please request a new OTP." };
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false as const, error: "This OTP has expired. Please request a new one." };
  }
  if (row.attempts >= OTP_MAX_ATTEMPTS) {
    return { ok: false as const, error: "Too many attempts. Please request a new OTP." };
  }
  console.log("Entered OTP:", code);
console.log("Stored Hash:", row.code_hash);
console.log("Generated Hash:", hashCode(phone, code));
  if (row.code_hash !== hashCode(phone, code)) {
    await supabaseAdmin
      .from("phone_otps")
      .update({ attempts: row.attempts + 1 })
      .eq("id", row.id);
    return { ok: false as const, error: "Invalid OTP" };
  }

  await supabaseAdmin
    .from("phone_otps")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", row.id);

  return { ok: true as const };
}

/** True when this phone completed OTP verification recently enough to register. */
export async function hasRecentVerification(phone: string, purpose: OtpPurpose) {
  const since = new Date(Date.now() - OTP_VERIFICATION_WINDOW_MINUTES * 60_000).toISOString();
  const { data } = await supabaseAdmin
    .from("phone_otps")
    .select("id")
    .eq("phone", phone)
    .eq("purpose", purpose)
    .not("consumed_at", "is", null)
    .gte("consumed_at", since)
    .limit(1)
    .maybeSingle();
  return Boolean(data);
}
