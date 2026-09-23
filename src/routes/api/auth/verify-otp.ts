import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { otps, isValidPhone, normalizePhone } from "@/lib/auth-mock.server";

const schema = z.object({ phone: z.string().min(6).max(20), otp: z.string().regex(/^\d{6}$/) });

export const Route = createFileRoute("/api/auth/verify-otp")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
        }
        const parsed = schema.safeParse(body);
        if (!parsed.success) return Response.json({ error: "Invalid OTP" }, { status: 400 });
        if (!isValidPhone(parsed.data.phone)) {
          return Response.json({ error: "Invalid Phone Number" }, { status: 400 });
        }
        const phone = normalizePhone(parsed.data.phone);
        const entry = otps.get(phone);
        if (!entry) return Response.json({ error: "OTP Expired" }, { status: 400 });
        if (Date.now() > entry.expiresAt) {
          otps.delete(phone);
          return Response.json({ error: "OTP Expired" }, { status: 400 });
        }
        if (entry.code !== parsed.data.otp) {
          return Response.json({ error: "Invalid OTP" }, { status: 400 });
        }
        entry.verified = true;
        return Response.json({ message: "OTP Verified Successfully" });
      },
    },
  },
});
