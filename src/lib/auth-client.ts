import { toast } from "sonner";

export const phoneRegex = /^[6-9]\d{9}$/;

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export const passwordChecks = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export function validatePassword(v: string) {
  const failed = passwordChecks.find((c) => !c.test(v));
  return failed ? failed.label : null;
}

export async function postJson<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; data: T & { error?: string; message?: string } }> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as T & { error?: string };
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: "Something went wrong. Please try again." } as T & { error?: string } };
  }
}

export function notifyError(message?: string) {
  toast.error(message ?? "Something went wrong. Please try again.");
}

/** Normalises thrown server-function errors into a user-facing message. */
export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err instanceof Error && err.message) {
    // Strip TanStack server-fn wrapper noise if present.
    const match = /"message"\s*:\s*"([^"]+)"/.exec(err.message);
    return (match?.[1] ?? err.message).slice(0, 300);
  }
  if (typeof err === "string" && err) return err;
  return fallback;
}
