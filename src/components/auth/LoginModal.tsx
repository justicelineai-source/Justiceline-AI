import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OtpStep } from "@/components/auth/OtpStep";
import { normalizePhone, phoneRegex, errorMessage } from "@/lib/auth-client";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { sendPhoneOtp, otpLoginToken, resolveLoginEmail, resolveResetEmail } from "@/lib/auth.functions";
import { Loader2, Shield } from "lucide-react";

export function LoginModal() {
  const { loginModalOpen, closeLogin, completeLogin } = useAuth();
  const navigate = useNavigate();

  // Password tab state
  const [identifier, setIdentifier] = useState("");
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [remember, setRemember] = useState(true);

  // OTP tab state
  const [tab, setTab] = useState("password");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const finish = (method: "password" | "otp") => {
    const target = completeLogin(method, remember);
    toast.success("Login Successful");
    void navigate({ to: (target ?? "/dashboard") as string });
  };

  const sendOtp = async () => {
    const p = normalizePhone(phone);
    if (!phoneRegex.test(p)) {
      setPhoneError("Invalid Phone Number");
      return;
    }
    setPhoneError(null);
    setSending(true);
    try {
      const data = await sendPhoneOtp({ data: { phone: p, purpose: "login" } });
      setOtpSent(true);
      setOtp("");
      setOtpError(null);
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
      const { tokenHash, email } = await otpLoginToken({
        data: { phone: normalizePhone(phone), otp },
      });
     const { error } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
});
      if (error) throw error;
      setOtpError(null);
      finish("otp");
    } catch (err) {
      const message = errorMessage(err, "Invalid OTP");
      setOtpError(message);
      toast.error(message);
    } finally {
      setVerifying(false);
    }
  };

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = identifier.trim();
    const p = normalizePhone(raw);
    let bad = false;
    if (!raw.includes("@") && !phoneRegex.test(p)) {
      setIdentifierError("Enter your registered phone number");
      bad = true;
    } else setIdentifierError(null);
    if (password.length < 8) {
      setPasswordError("Minimum 8 characters");
      bad = true;
    } else setPasswordError(null);
    if (bad) return;

    setSigningIn(true);
    try {
      const { email } = await resolveLoginEmail({ data: { identifier: raw } });
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Invalid credentials. Please check and try again.");
      setPasswordError(null);
      finish("password");
    } catch (err) {
      const message = errorMessage(err);
      setPasswordError(message);
      toast.error(message);
    } finally {
      setSigningIn(false);
    }
  };

  const forgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    const raw = identifier.trim();
    if (!raw) {
      setIdentifierError("Enter your email or phone number first");
      return;
    }
    try {
      const { email } = await resolveResetEmail({ data: { identifier: raw } });
      if (email) {
        await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
      }
      toast.success("If an account exists, a password reset link is on its way.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };


  return (
    <Dialog open={loginModalOpen} onOpenChange={(o) => !o && closeLogin()}>
      <DialogContent
        
        className="max-w-md gap-0 overflow-hidden rounded-[20px] border-border/60 bg-card p-0 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.45)] sm:max-w-md"
      >
        <div className="px-6 pb-6 pt-8 sm:px-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <h2 className="mt-5 text-center font-serif text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="mt-1.5 text-center text-sm text-muted-foreground">
            Sign in to continue to your legal workspace.
          </p>

          <Tabs value={tab} onValueChange={setTab} className="mt-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="password" className="rounded-lg">Login with Password</TabsTrigger>
              <TabsTrigger value="otp" className="rounded-lg">Login with OTP</TabsTrigger>
            </TabsList>

            {/* Password first */}
            <TabsContent value="password" className="mt-6">
              <form onSubmit={signInWithPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-identifier">Phone number</Label>
                  <Input
                    id="login-identifier"
                    autoFocus
                    placeholder="Enter your phone number"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                  {identifierError && <p className="text-xs text-destructive">{identifierError}</p>}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <a href="#" onClick={forgotPassword} className="text-xs font-medium text-primary hover:underline">Forgot password?</a>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox checked={remember} onCheckedChange={(c) => setRemember(c === true)} /> Remember me for 30 days
                </label>
                <Button
                  type="submit"
                  disabled={signingIn}
                  className="w-full bg-brand-gradient text-white transition-all hover:opacity-95"
                >
                  {signingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground"></p>
              
              </form>
            </TabsContent>

            {/* OTP */}
            <TabsContent value="otp" className="mt-6 space-y-4">
              {!otpSent ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void sendOtp();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="login-otp-phone">Phone number</Label>
                    <Input
                      id="login-otp-phone"
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
              ) : (
                <OtpStep
                  phone={normalizePhone(phone)}
                  value={otp}
                  onChange={setOtp}
                  onVerify={() => void verifyOtp()}
                  onResend={sendOtp}
                  onEditPhone={() => setOtpSent(false)}
                  verifying={verifying}
                  resending={sending}
                  error={otpError}
                />
              )}
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" onClick={closeLogin} className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </p>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <Shield className="h-3 w-3" /> Encrypted, privileged-by-design workspace
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
