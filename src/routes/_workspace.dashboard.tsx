import { createFileRoute, Link } from "@tanstack/react-router";
import {
  MessageCircle,
  FileText,
  Bookmark,
  ArrowUpRight,
  ArrowRight,
  Scale,
  Search,
  Star,
  Clock,
  ChevronRight,
  FilePlus2,
  History as HistoryIcon,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
 
export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · JusticeLine AI" },
      { name: "description", content: "Your JusticeLine AI legal workspace — continue research, draft documents, and search judgments." },
      { property: "og:title", content: "Dashboard · JusticeLine AI" },
      { property: "og:description", content: "Premium AI legal workspace for advocates and law firms." },
    ],
  }),
  component: Dashboard,
});
 
const quickActions = [
    {
    icon: Scale,
    emoji: "⚖️",
    title: "Search Judgments",
    desc: "Search Supreme Court, High Court judgments, Acts, Sections, and legal precedents.",
    cta: "Search",
    to: "/judgments" as const,
  },
  {
    icon: MessageCircle,
    emoji: "💬",
    title: "AI Legal Chat",
    desc: "Ask legal questions, search Acts, Sections, Judgments, and receive AI-powered legal guidance.",
    cta: "Start Chat",
    to: "/chat" as const,
  },
  {
    icon: FilePlus2,
    emoji: "📝",
    title: "Create Legal Draft",
    desc: "Generate professional legal documents using guided forms.",
    examples: ["Sale Deed", "Affidavit", "Legal Notice", "Rental Agreement"],
    cta: "Create Draft",
    to: "/draft" as const,
  },
 
  {
    icon: Bookmark,
    emoji: "📂",
    title: "Saved Drafts",
    desc: "View, edit, and download your previously generated legal drafts.",
    cta: "Open Drafts",
    to: "/saved" as const,
  },
];
 
const recentChats = [
  { title: "Property Dispute", time: "2h ago" },
  { title: "Sale Deed Requirements", time: "Yesterday" },
  { title: "Legal Notice Format", time: "2 days ago" },
];
 
const recentDrafts = [
  { title: "Sale Deed", time: "Today · 10:45 AM" },
  { title: "Affidavit", time: "Yesterday" },
  { title: "Employment Agreement", time: "3 days ago" },
];
 
const favorites = [
  { title: "Sale Deed", to: "/draft/sale-deed" as const },
  { title: "Legal Notice", to: "/draft" as const },
  { title: "Affidavit", to: "/draft" as const },
  { title: "Employment Agreement", to: "/draft" as const },
];
 
const recentSearches = [
  "Transfer of Property Act",
  "Section 138 NI Act",
  "Sale Deed",
  "Affidavit",
];
 
function Dashboard() {
 
  return (
    <>
      <AppHeader title="Dashboard" subtitle="Your JusticeLine AI workspace" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
     
 
          {/* Quick Actions */}
          <section>
            <div className="mb-4">
              <h3 className="font-serif text-lg font-semibold">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">Jump into your most-used tools.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((a) => (
                <div
                  key={a.title}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-elegant transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-premium"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/5 text-primary">
                      <a.icon className="h-5 w-5" />
                    </div>
                    <div className="text-base font-semibold text-foreground">{a.title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
                  {a.examples && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {a.examples.map((e) => (
                        <span
                          key={e}
                          className="rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 flex-1" />
                  <Link to={a.to}>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-border bg-background hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    >
                      {a.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>
 
          {/* Continue Working */}
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-premium sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
            <Scale className="pointer-events-none absolute bottom-4 right-4 h-24 w-24 text-white/5" />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  <Clock className="h-3.5 w-3.5" /> Continue Working
                </div>
                <h3 className="mt-2 font-serif text-xl font-semibold sm:text-2xl">Sale Deed</h3>
                <p className="mt-1 text-sm text-white/70">Last edited · Today · 10:45 AM</p>
              </div>
              <Link to="/draft/preview">
                <Button className="bg-gold-gradient text-gold-foreground hover:opacity-95">
                  Resume Draft <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </section>
 
          {/* Recent Activity */}
          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold">Recent Activity</h3>
                <p className="text-sm text-muted-foreground">Pick up where you left off.</p>
              </div>
              <Link to="/history" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <ActivityList
                title="Recent AI Chats"
                icon={MessageCircle}
                to="/chat"
                items={recentChats}
              />
              <ActivityList
                title="Recent Drafts"
                icon={FileText}
                to="/saved"
                items={recentDrafts}
              />
            </div>
          </section>
 
         
        </div>
      </main>
    </>
  );
}
 
function ActivityList({
  title,
  icon: Icon,
  to,
  items,
}: {
  title: string;
  icon: typeof MessageCircle;
  to: "/chat" | "/saved";
  items: { title: string; time: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-elegant">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h4 className="font-serif text-base font-semibold">{title}</h4>
        </div>
        <Link to={to} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      <ul className="divide-y divide-border">
        {items.map((r) => (
          <li key={r.title}>
            <Link
              to={to}
              className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.time}</div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
 