import { createFileRoute } from "@tanstack/react-router";
import { Sun, Moon, Monitor, Shield, Languages, KeyRound, Trash2, Lock, Check } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme, type Theme } from "@/lib/theme";
import { toast } from "sonner";

export const Route = createFileRoute("/_workspace/settings")({
  head: () => ({
    meta: [
      { title: "Settings · JusticeLine AI" },
      { name: "description", content: "Theme, language, privacy and security settings." },
      { property: "og:title", content: "Settings · JusticeLine AI" },
      { property: "og:description", content: "Manage workspace settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const themes: { id: Theme; label: string; icon: typeof Sun }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];

  return (
    <>
      <AppHeader title="Settings" subtitle="Configure your workspace" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <Section title="Appearance" desc="Choose how JusticeLine looks to you.">
            <div className="grid gap-3 sm:grid-cols-3">
              {themes.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      toast.success(`${t.label} theme applied`);
                    }}
                    className={`group relative flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-elegant"
                        : "border-border hover:-translate-y-0.5 hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`grid h-10 w-10 place-items-center rounded-lg transition-colors ${
                      active ? "bg-brand-gradient text-gold" : "bg-secondary text-muted-foreground"
                    }`}>
                      <t.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{t.label}</span>
                    {active && (
                      <span className="ml-auto grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Language & Region" desc="Choose your language and jurisdiction.">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Interface language</Label>
                <div className="relative">
                  <Languages className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <select className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm outline-none focus:border-primary/40">
                    <option>English (India)</option>
                    <option>हिन्दी</option>
                    <option>தமிழ்</option>
                    <option>বাংলা</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Primary jurisdiction</Label>
                <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary/40">
                  <option>India — Supreme Court & High Courts</option>
                  <option>India — Delhi HC</option>
                  <option>India — Bombay HC</option>
                  <option>India — Madras HC</option>
                </select>
              </div>
            </div>
          </Section>

          <Section title="Privacy" desc="Control how your data is used.">
            <div className="divide-y divide-border">
              {[
                ["Improve AI with anonymised data", "Help train JusticeLine models with fully anonymised queries.", false],
                ["Share matter analytics", "Aggregate usage stats visible to your firm admin.", true],
                ["Third-party integrations", "Allow connections to your DMS and calendar.", true],
              ].map(([t, d, on]) => (
                <div key={t as string} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{t}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                  <Switch defaultChecked={on as boolean} />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Security" desc="Protect your account.">
            <div className="space-y-4">
              <Row icon={KeyRound} title="Two-factor authentication" desc="Add an extra layer of protection at sign-in." action={<Button variant="outline" size="sm">Enable</Button>} />
              <Row icon={Shield} title="Active sessions" desc="3 devices currently signed in." action={<Button variant="outline" size="sm">Manage</Button>} />
              <Row icon={Lock} title="Privileged mode" desc="Mask client information from screenshots and previews." action={<Switch />} />
            </div>
          </Section>

          <Section title="Danger zone" desc="Irreversible actions." tone="destructive">
            <Row icon={Trash2} title="Delete account" desc="Permanently delete your workspace and all data." action={<Button variant="destructive" size="sm">Delete</Button>} />
          </Section>
        </div>
      </main>
    </>
  );
}

function Section({
  title, desc, children, tone,
}: { title: string; desc: string; children: React.ReactNode; tone?: "destructive" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border bg-card shadow-elegant ${tone === "destructive" ? "border-destructive/30" : "border-border"}`}>
      <div className={`border-b px-6 py-4 ${tone === "destructive" ? "border-destructive/20 bg-destructive/5" : "border-border"}`}>
        <h3 className="font-serif text-lg font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

function Row({
  icon: Icon, title, desc, action,
}: { icon: typeof Shield; title: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      {action}
    </div>
  );
}
