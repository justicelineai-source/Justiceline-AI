import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { users, otps, isValidPhone, normalizePhone } from "@/lib/auth-mock.server";

const schema = z.object({
  phone: z.string().min(6).max(20),
  password: z.string().min(1).max(200).optional(),
  otp: z.string().regex(/^\d{6}$/).optional(),
});

export const Route = createFileRoute("/api/auth/login")({
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
        if (!parsed.success) {
          return Response.json({ error: "Something went wrong. Please try again." }, { status: 400 });
        }
        const { password, otp } = parsed.data;
        if (!isValidPhone(parsed.data.phone)) {
          return Response.json({ error: "Invalid Phone Number" }, { status: 400 });
        }
        const phone = normalizePhone(parsed.data.phone);

        if (otp) {
          const entry = otps.get(phone);
          if (!entry) return Response.json({ error: "OTP Expired" }, { status: 400 });
          if (Date.now() > entry.expiresAt) {
            otps.delete(phone);
            return Response.json({ error: "OTP Expired" }, { status: 400 });
          }
          if (entry.code !== otp) return Response.json({ error: "Invalid OTP" }, { status: 400 });
          otps.delete(phone);
          return Response.json({ message: "Login Successful" });
        }

        const user = users.get(phone);
        // Prototype: unknown numbers are accepted so the demo flow always works.
        if (user && user.password !== password) {
          return Response.json({ error: "Incorrect Password" }, { status: 401 });
        }
        if (!password) {
          return Response.json({ error: "Incorrect Password" }, { status: 401 });
        }
        return Response.json({ message: "Login Successful" });
      },
    },
  },
});
