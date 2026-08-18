import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { otps, users, isValidPhone, normalizePhone, findUserByEmail } from "@/lib/auth-mock.server";

const passwordRules = z
  .string()
  .min(8)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/\d/)
  .regex(/[^A-Za-z0-9]/);

const schema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(255),
  phone: z.string().min(6).max(20),
  password: passwordRules,
});

export const Route = createFileRoute("/api/auth/signup")({
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
        const data = parsed.data;
        if (!isValidPhone(data.phone)) {
          return Response.json({ error: "Invalid Phone Number" }, { status: 400 });
        }
        const phone = normalizePhone(data.phone);
        const entry = otps.get(phone);
        if (!entry?.verified) {
          return Response.json({ error: "Invalid OTP" }, { status: 400 });
        }
        if (users.has(phone)) {
          return Response.json({ error: "Phone Number Already Registered" }, { status: 409 });
        }
        if (findUserByEmail(data.email)) {
          return Response.json({ error: "Email Already Registered" }, { status: 409 });
        }
        users.set(phone, { ...data, phone });
        otps.delete(phone);
        return Response.json({ message: "Account Created Successfully" });
      },
    },
  },
});
