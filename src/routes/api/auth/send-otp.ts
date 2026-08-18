import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { otps, isValidPhone, normalizePhone, OTP_TTL_MS } from "@/lib/auth-mock.server";

const schema = z.object({ phone: z.string().min(6).max(20) });

export const Route = createFileRoute("/api/auth/send-otp")({
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
        if (!parsed.success || !isValidPhone(parsed.data.phone)) {
          return Response.json({ error: "Invalid Phone Number" }, { status: 400 });
        }
        const phone = normalizePhone(parsed.data.phone);
        const code = String(Math.floor(100000 + Math.random() * 900000));
        otps.set(phone, { code, expiresAt: Date.now() + OTP_TTL_MS, verified: false });
        // Prototype only: the OTP is returned so it can be shown in the UI.
        return Response.json({ message: "OTP Sent Successfully", devOtp: code, expiresIn: OTP_TTL_MS / 1000 });
      },
    },
  },
});
