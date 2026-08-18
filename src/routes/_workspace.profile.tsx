import { createFileRoute } from "@tanstack/react-router";
import { Camera, Mail, Phone, MapPin, Briefcase, Award } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_workspace/profile")({
  head: () => ({
    meta: [
      { title: "Profile · JusticeLine AI" },
      { name: "description", content: "Manage your JusticeLine profile and preferences." },
      { property: "og:title", content: "Profile · JusticeLine AI" },
      { property: "og:description", content: "Manage your profile." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, profile } = useAuth();

const firstName =
  profile?.first_name ??
  user?.user_metadata?.first_name ??
  "";

const lastName =
  profile?.last_name ??
  user?.user_metadata?.last_name ??
  "";

const fullName = `${firstName} ${lastName}`.trim();

const initials =
  fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const email = user?.email ?? "";

const phone =
  profile?.phone ??
  user?.user_metadata?.phone ??
  "";
  return (
    <>
      <AppHeader title="Profile" subtitle="Manage your personal details and preferences" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-elegant">
              <div className="relative mx-auto h-24 w-24">
                <div className="grid h-24 w-24 place-items-center rounded-full bg-brand-gradient text-2xl font-semibold text-white shadow-premium">
                  {initials || "U"}
                </div>
                <button className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-4 border-card bg-gold-gradient text-gold-foreground">
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <h2 className="mt-4 font-serif text-lg font-semibold">{fullName || "Logged In User"}</h2>
              <p className="text-xs text-muted-foreground">JusticeLine AI User</p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a6408]">Pro Plan</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Verified</span>
              </div>
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-5 text-sm shadow-elegant">
             <Info icon={Mail} label="Email" value={email} />
<Info icon={Phone} label="Phone" value={phone} />
            </div>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card shadow-elegant">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-semibold">Personal Details</h3>
                <p className="text-xs text-muted-foreground">Update how your name and contact appear.</p>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
<Field label="First name" defaultValue={firstName} />
<Field label="Last name" defaultValue={lastName} />
<Field label="Email" type="email" defaultValue={email} />
<Field label="Phone" defaultValue={phone} />
<Field label="Bar Council Number" />
<Field label="Specialisation" />
                <div className="sm:col-span-2 flex justify-end">
                  <Button className="bg-brand-gradient text-white hover:opacity-95">Save changes</Button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-elegant">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-semibold">Change Password</h3>
                <p className="text-xs text-muted-foreground">Use a strong, unique password.</p>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-3">
                <Field label="Current password" type="password" />
                <Field label="New password" type="password" />
                <Field label="Confirm new password" type="password" />
                <div className="sm:col-span-3 flex justify-end">
                  <Button variant="outline">Update password</Button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card shadow-elegant">
              <div className="border-b border-border px-6 py-4">
                <h3 className="font-serif text-lg font-semibold">Notifications</h3>
              </div>
              <div className="divide-y divide-border">
                {[
                  ["Draft-ready emails", "Get notified when a draft finishes generating."],
                  ["Weekly matter digest", "Summary of your activity every Monday."],
                  ["New judgment alerts", "SC / HC judgments relevant to your matters."],
                  ["Product updates", "Occasional emails about new features."],
                ].map(([t, d], i) => (
                  <div key={t} className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm font-medium">{t}</p>
                      <p className="text-xs text-muted-foreground">{d}</p>
                    </div>
                    <Switch defaultChecked={i < 3} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

function Field({ label, type = "text", defaultValue }: { label: string; type?: string; defaultValue?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} defaultValue={defaultValue} />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/5 text-primary">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}
