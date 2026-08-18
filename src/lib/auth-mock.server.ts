// In-memory mock auth store (frontend prototype only — no database).
type OtpEntry = { code: string; expiresAt: number; verified: boolean };
type User = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

const g = globalThis as unknown as {
  __jl_otps?: Map<string, OtpEntry>;
  __jl_users?: Map<string, User>;
};

export const otps: Map<string, OtpEntry> = (g.__jl_otps ??= new Map());
export const users: Map<string, User> = (g.__jl_users ??= new Map());

export const OTP_TTL_MS = 5 * 60 * 1000;

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-10);
}

export function isValidPhone(phone: string) {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone));
}

export function findUserByEmail(email: string) {
  for (const u of users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) return u;
  }
  return undefined;
}
