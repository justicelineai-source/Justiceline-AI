import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, "").slice(-10))
  .refine((v) => /^[6-9]\d{9}$/.test(v), "Invalid Phone Number");

const otpSchema = z.string().regex(/^\d{6}$/, "Enter the 6-digit OTP");

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email").max(255);

const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Z]/, "One uppercase letter required")
  .regex(/[a-z]/, "One lowercase letter required")
  .regex(/\d/, "One number required")
  .regex(/[^A-Za-z0-9]/, "One special character required");

/** Sends a phone OTP for signup or OTP login. */
export const sendPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string; purpose: "signup" | "login" }) =>
    z.object({ phone: phoneSchema, purpose: z.enum(["signup", "login"]) }).parse(input),
  )
  .handler(async ({ data }) => {
  const { issueOtp } = await import("@/lib/auth-service.server");

  const otp = await issueOtp(data.phone, data.purpose);

  console.log("Generated OTP:", otp);

  return {
    sent: true,
    devOtp: otp,
  };
});

/** Verifies a signup OTP; the phone stays verified long enough to finish registration. */
export const verifySignupOtp = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string; otp: string }) =>
    z.object({
      phone: phoneSchema,
      otp: otpSchema,
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { consumeOtp } = await import("@/lib/auth-service.server");

    const result = await consumeOtp(
      data.phone,
      data.otp,
      "signup"
    );

    if (!result.ok) {
      throw new Error(result.error);
    }

    return {
      verified: true,
    };
  });

/** Creates the account after the phone has been verified. */
export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      password: string;
      termsAccepted: boolean;
    }) =>
      z
        .object({
          firstName: z.string().trim().min(1, "Required").max(60),
          lastName: z.string().trim().min(1, "Required").max(60),
          email: emailSchema,
          phone: phoneSchema,
          password: passwordSchema,
          termsAccepted: z.literal(true, { message: "You must accept the terms" }),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const { hasRecentVerification, findProfileByEmail, findProfileByPhone } = await import(
      "@/lib/auth-service.server"
    );
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

   // if (!(await hasRecentVerification(data.phone, "signup"))) {
   //   throw new Error("Please verify your phone number again.");
   // }
    if (await findProfileByPhone(data.phone)) {
      throw new Error("This phone number is already registered.");
    }
    if (await findProfileByEmail(data.email)) {
      throw new Error("This email address is already registered.");
    }

   const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
  email: data.email,
  phone: data.phone,   // <-- Add this
  password: data.password,
  email_confirm: true,

  user_metadata: {
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    phone_verified: true,
    terms_accepted: data.termsAccepted,
    login_method: "password",
  },
});

    if (error || !created.user) {
      const message = error?.message ?? "Could not create the account.";
      if (/already/i.test(message)) throw new Error("This email address is already registered.");
      throw new Error(message);
    }
const { error: profileError } = await supabaseAdmin
  .from("profiles")
  .insert({
    id: created.user.id,
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    account_status: "active",
  });

if (profileError) {
  await supabaseAdmin.auth.admin.deleteUser(created.user.id);

  console.error(profileError);
  throw new Error(profileError.message);
}
    return { email: data.email };
  });

/** Resolves an email or phone identifier to the account email for password sign-in. */
export const resolveLoginEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { identifier: string }) =>
    z.object({ identifier: z.string().trim().min(1, "Required").max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { findProfileByEmail, findProfileByPhone } = await import("@/lib/auth-service.server");
    const identifier = data.identifier.trim();
    const digits = identifier.replace(/\D/g, "").slice(-10);

    const profile = identifier.includes("@")
      ? await findProfileByEmail(identifier)
      : /^[6-9]\d{9}$/.test(digits)
        ? await findProfileByPhone(digits)
        : null;

    if (!profile?.email) throw new Error("Invalid credentials. Please check and try again.");
    if (profile.account_status !== "active") throw new Error("This account is not active.");
    return { email: profile.email };
  });

/** Verifies an OTP login and returns a single-use token the browser exchanges for a session. */
export const otpLoginToken = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string; otp: string }) =>
    z.object({ phone: phoneSchema, otp: otpSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { consumeOtp, findProfileByPhone } = await import("@/lib/auth-service.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const profile = await findProfileByPhone(data.phone);
    if (!profile?.email) throw new Error("No account found for this phone number.");

    const result = await consumeOtp(data.phone, data.otp, "login");
    if (!result.ok) throw new Error(result.error);

    const { data: link, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: profile.email,
    });
    if (error || !link.properties?.hashed_token) {
      throw new Error("Could not complete sign in. Please try again.");
    }

    return { tokenHash: link.properties.hashed_token, email: profile.email };
  });

/** Resolves an email or phone to the account email so a reset link can be sent. */
export const resolveResetEmail = createServerFn({ method: "POST" })
  .inputValidator((input: { identifier: string }) =>
    z.object({ identifier: z.string().trim().min(1, "Required").max(255) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { findProfileByEmail, findProfileByPhone } = await import("@/lib/auth-service.server");
    const identifier = data.identifier.trim();
    const digits = identifier.replace(/\D/g, "").slice(-10);
    const profile = identifier.includes("@")
      ? await findProfileByEmail(identifier)
      : await findProfileByPhone(digits);
    // Never reveal whether an account exists.
    return { email: profile?.email ?? null };
  });

/** Records a successful sign-in against the signed-in user. */
export const recordLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { method: "password" | "otp"; device: string; browser: string; platform: string }) =>
    z
      .object({
        method: z.enum(["password", "otp"]),
        device: z.string().max(120),
        browser: z.string().max(120),
        platform: z.string().max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const ip =
      request?.headers.get("cf-connecting-ip") ??
      request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      null;

    const { data: row } = await context.supabase
      .from("login_history")
      .insert({
        user_id: context.userId,
        login_method: data.method,
        device: data.device,
        browser: data.browser,
        platform: data.platform,
        ip_address: ip,
      })
      .select("id")
      .single();

    await context.supabase
      .from("profiles")
      .update({ last_login: new Date().toISOString(), login_method: data.method })
      .eq("id", context.userId);

    return { loginHistoryId: row?.id ?? null };
  });

/** Closes the open login-history row and stamps the logout time. */
export const recordLogout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { loginHistoryId?: string | null }) =>
    z.object({ loginHistoryId: z.string().uuid().nullish() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const now = new Date().toISOString();

    if (data.loginHistoryId) {
      await context.supabase
        .from("login_history")
        .update({ logout_time: now })
        .eq("id", data.loginHistoryId)
        .eq("user_id", context.userId);
    } else {
      const { data: open } = await context.supabase
        .from("login_history")
        .select("id")
        .eq("user_id", context.userId)
        .is("logout_time", null)
        .order("login_time", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (open) {
        await context.supabase.from("login_history").update({ logout_time: now }).eq("id", open.id);
      }
    }

    await context.supabase.from("profiles").update({ last_logout: now }).eq("id", context.userId);
    return { ok: true };
  });
