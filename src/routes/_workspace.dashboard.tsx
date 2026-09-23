import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MessageCircle,
  FileText,
  Bookmark,
  ArrowUpRight,
  ArrowRight,
  Scale,
  Clock,
  FilePlus2,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import { loadConversations, setActiveId, type Conversation } from "@/lib/chat-store";
 
export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · JusticeLine AI" },
      { name: "description", content: "Your JusticeLine AI legal workspace." },
    ],
  }),
  component: Dashboard,
});
 
const quickActions = [
  {
    icon: Scale,
    title: "Search Judgments",
    desc: "Search Supreme Court, High Court judgments, Acts, and Sections.",
    cta: "Search",
    to: "/judgments" as const,
  },
  {
    icon: MessageCircle,
    title: "AI Legal Chat",
    desc: "Ask legal questions and receive AI-powered legal guidance.",
    cta: "Start Chat",
    to: "/chat" as const,
  },
  {
    icon: FilePlus2,
    title: "Create Legal Draft",
    desc: "Generate professional legal documents using guided templates.",
    cta: "Create Draft",
    to: "/draft" as const,
  },
  {
    icon: Bookmark,
    title: "Saved Drafts",
    desc: "View and edit your previously generated legal drafts.",
    cta: "Open Drafts",
    to: "/saved" as const,
  },
];
 
const recentDrafts = [
  { title: "Sale Deed", time: "Today · 10:45 AM" },
  { title: "Affidavit", time: "Yesterday" },
  { title: "Employment Agreement", time: "3 days ago" },
];
 
function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
 
function Dashboard() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
 
  useEffect(() => {
    setConversations(loadConversations());
  }, []);
 
  const handleSelectChat = (id: string) => {
    setActiveId(id);
    navigate({ to: "/chat" });
  };
 
  const dynamicChats = conversations.slice(0, 3).map((c) => ({
    id: c.id,
    title: c.title,
    time: formatRelativeTime(c.updatedAt || Date.now()),
  }));
 
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
                  className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/5 text-primary">
                      <a.icon className="h-5 w-5" />
                    </div>
                    <div className="text-base font-semibold text-foreground">{a.title}</div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{a.desc}</p>
                  <div className="mt-5 flex-1" />
                  <Link to={a.to}>
                    <Button
                      variant="outline"
                      className="w-full justify-between border-border bg-background hover:bg-secondary/60"
                    >
                      {a.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </section>
 
          {/* Continue Working */}
          <section className="relative overflow-hidden rounded-2xl bg-brand-gradient p-6 text-white shadow-md sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
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
              {/* Redirect to All in History */}
              <Link
                to="/history"
                search={{ filter: "all" }}
                className="text-xs font-medium text-primary hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Recent AI Chats Feed */}
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    <h4 className="font-serif text-base font-semibold">Recent AI Chats</h4>
                  </div>
                  {/* Redirect to AI Chat filter in History */}
                  <Link
                    to="/history"
                    search={{ filter: "chat" }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="divide-y divide-border">
                  {dynamicChats.length === 0 ? (
                    <li className="px-5 py-4 text-xs text-muted-foreground">No recent chats yet.</li>
                  ) : (
                    dynamicChats.map((r) => (
                      <li
                        key={r.id}
                        onClick={() => handleSelectChat(r.id)}
                        className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {r.title}
                          </div>
                          <div className="text-xs text-muted-foreground">{r.time}</div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      </li>
                    ))
                  )}
                </ul>
              </div>
 
              {/* Recent Drafts Feed */}
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h4 className="font-serif text-base font-semibold">Recent Drafts</h4>
                  </div>
                  {/* Redirect to Legal Drafts filter in History */}
                  <Link
                    to="/history"
                    search={{ filter: "draft" }}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View all
                  </Link>
                </div>
                <ul className="divide-y divide-border">
                  {recentDrafts.map((r) => (
                    <li key={r.title}>
                      <Link
                        to="/saved"
                        className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/40"
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.time}</div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
 