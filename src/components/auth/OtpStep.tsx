import { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";

type Props = {
  phone: string;
  value: string;
  onChange: (v: string) => void;
  onVerify: () => void;
  onResend: () => void | Promise<void>;
  onEditPhone: () => void;
  verifying: boolean;
  resending: boolean;
  error?: string | null;
};

export function OtpStep({
  phone,
  value,
  onChange,
  onVerify,
  onResend,
  onEditPhone,
  verifying,
  resending,
  error,
}: Props) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-3">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
        <div className="text-sm">
          <p className="font-medium">Enter the 6-digit code</p>
          <p className="text-muted-foreground">
            Sent to +91 {phone}.{" "}
            <button type="button" onClick={onEditPhone} className="font-medium text-primary hover:underline">
              Change
            </button>
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <InputOTP maxLength={6} value={value} onChange={onChange} disabled={verifying}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="h-12 w-11 rounded-xl text-base" />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      <Button
        type="button"
        onClick={onVerify}
        disabled={verifying || value.length !== 6}
        className="w-full bg-brand-gradient text-white transition-all hover:opacity-95"
      >
        {verifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying OTP…
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {seconds > 0 ? (
          <>Resend OTP in {seconds}s</>
        ) : (
          <button
            type="button"
            disabled={resending}
            onClick={async () => {
              await onResend();
              setSeconds(30);
            }}
            className="font-medium text-primary hover:underline disabled:opacity-60"
          >
            {resending ? "Sending OTP…" : "Resend OTP"}
          </button>
        )}
      </p>
    </div>
  );
}
