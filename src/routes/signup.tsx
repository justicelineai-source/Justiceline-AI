import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { OtpStep } from "@/components/auth/OtpStep";
import { normalizePhone, phoneRegex, passwordChecks, errorMessage } from "@/lib/auth-client";
import { Check, Scale, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { sendPhoneOtp, verifySignupOtp, registerAccount } from "@/lib/auth.functions";


export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account · JusticeLine AI" },
      { name: "description", content: "Create your JusticeLine AI legal workspace." },
      { property: "og:title", content: "Sign up · JusticeLine AI" },
      { property: "og:description", content: "Start your AI-powered legal workspace today." },
    ],
  }),
  component: SignupPage,
});

const passwordSchema = z
  .string()
  .min(8, "Minimum 8 characters")
  .regex(/[A-Z]/, "One uppercase letter required")
  .regex(/[a-z]/, "One lowercase letter required")
  .regex(/\d/, "One number required")
  .regex(/[^A-Za-z0-9]/, "One special character required");

const schema = z
  .object({
    firstName: z.string().trim().min(1, "Required").max(60),
    lastName: z.string().trim().min(1, "Required").max(60),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: passwordSchema,
    confirm: z.string(),
    terms: z.literal(true, { message: "You must accept the terms" }),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });
type FormValues = z.infer<typeof schema>;

function SignupPage() {
  const navigate = useNavigate();
  const { openLogin, completeLogin } = useAuth();
  const [step, setStep] = useState<"phone" | "otp" | "details">("phone");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { terms: undefined as unknown as true },
  });
  const passwordValue = watch("password") ?? "";

  const sendOtp = async () => {
    const p = normalizePhone(phone);
    if (!phoneRegex.test(p)) {
      setPhoneError("Invalid Phone Number");
      return;
    }
    setPhoneError(null);
    setSending(true);
    try {
      const data = await sendPhoneOtp({ data: { phone: p, purpose: "signup" } });
      setOtp("");
      setOtpError(null);
      setStep("otp");
      toast.success("OTP Sent Successfully", {
        description: data.devOtp ? `Demo code: ${data.devOtp}` : undefined,
      });
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const verifyOtp = async () => {
    setVerifying(true);
    try {
      await verifySignupOtp({ data: { phone: normalizePhone(phone), otp } });
      setOtpError(null);
      toast.success("OTP Verified Successfully");
      setStep("details");
    } catch (err) {
      const message = errorMessage(err);
      setOtpError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (v: FormValues) => {
    try {
      const { email } = await registerAccount({
        data: {
          firstName: v.firstName,
          lastName: v.lastName,
          email: v.email,
          phone: normalizePhone(phone),
          password: v.password,
          termsAccepted: true,
        },
      });

      // Sign the new user straight in, then continue to the dashboard.
      const { error } = await supabase.auth.signInWithPassword({ email, password: v.password });
      if (error) throw error;

      toast.success("Account Created Successfully");
      completeLogin("password", true);
      await navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };


  const steps = ["Phone", "Verify", "Details"] as const;
  const stepIndex = step === "phone" ? 0 : step === "otp" ? 1 : 2;

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 80% 20%, rgba(184,134,11,0.35), transparent 45%), radial-gradient(circle at 15% 80%, rgba(255,255,255,0.1), transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-2 text-sm text-white/70">
          <Scale className="h-5 w-5 text-gold" /> Trusted legal intelligence
        </div>
        <div className="relative space-y-6">
          <h2 className="font-serif text-3xl font-semibold leading-tight">
            The complete AI workspace for the modern legal practice.
          </h2>
          <ul className="space-y-3 text-sm text-white/80">
            {[
              "Grounded answers with cited case law",
              "Court-ready drafts in minutes, not hours",
              "Matter-based history and document library",
              "Bank-grade security and privileged handling",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-gold-gradient text-gold-foreground">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative grid grid-cols-3 gap-4 text-center">
          {[
            { v: "10k+", l: "Questions" },
            { v: "5k+", l: "Drafts" },
            { v: "99%", l: "Satisfaction" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="font-serif text-xl font-semibold text-gold">{s.v}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/60">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join 1,000+ legal professionals modernising their practice.
          </p>

          {/* Step indicator */}
          <div className="mt-6 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors ${
                    i <= stepIndex
                      ? "bg-brand-gradient text-white"
                      : "border border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className={`text-xs ${i <= stepIndex ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>

          {step === "phone" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void sendOtp();
              }}
              className="mt-8 space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-brand-gradient text-white transition-all hover:opacity-95"
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP…
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          )}

          {step === "otp" && (
            <div className="mt-8">
              <OtpStep
                phone={normalizePhone(phone)}
                value={otp}
                onChange={setOtp}
                onVerify={() => void verifyOtp()}
                onResend={sendOtp}
                onEditPhone={() => setStep("phone")}
                verifying={verifying}
                resending={sending}
                error={otpError}
              />
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="Arjun" {...register("firstName")} />
                  {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Kapoor" {...register("lastName")} />
                  {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="you@chambers.law" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="verified-phone">Phone number</Label>
                <Input id="verified-phone" value={`+91 ${normalizePhone(phone)}`} readOnly disabled />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" {...register("confirm")} />
                  {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
                </div>
              </div>
              <ul className="grid gap-1 rounded-xl border border-border bg-muted/40 p-3 text-xs sm:grid-cols-2">
                {passwordChecks.map((c) => {
                  const passed = c.test(passwordValue);
                  return (
                    <li
                      key={c.label}
                      className={`flex items-center gap-1.5 ${passed ? "text-primary" : "text-muted-foreground"}`}
                    >
                      <Check className={`h-3 w-3 ${passed ? "opacity-100" : "opacity-30"}`} /> {c.label}
                    </li>
                  );
                })}
              </ul>
              <label className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={watch("terms") === true}
                  onCheckedChange={(c) =>
                    setValue("terms", (c === true) as true, { shouldValidate: true })
                  }
                  className="mt-0.5"
                />

                <span>
                  I agree to the <a href="#" className="text-primary underline">Terms of Service</a> and{" "}
                  <a href="#" className="text-primary underline">Privacy Policy</a>.
                </span>
              </label>
              {errors.terms && <p className="text-xs text-destructive">{errors.terms.message}</p>}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-gradient text-white transition-all hover:opacity-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating your account…
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={() => openLogin("/dashboard")} className="font-medium text-primary hover:underline">Sign in</button>
          </p>
        </div>
      </div>

    </div>
  );
}
