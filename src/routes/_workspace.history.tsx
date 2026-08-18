import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MessageCircle, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_workspace/history")({
  head: () => ({
    meta: [
      { title: "History · JusticeLine AI" },
      { name: "description", content: "Your past legal conversations and drafts." },
      { property: "og:title", content: "History · JusticeLine AI" },
      { property: "og:description", content: "Review past chats and drafts." },
    ],
  }),
  component: HistoryPage,
});

const groups = [
  {
    label: "Today",
    items: [
      { title: "Section 138 NI Act — recent SC interpretation", type: "Chat" },
      { title: "Sale Deed — Kapoor property transfer", type: "Draft" },
    ],
  },
  {
    label: "Yesterday",
    items: [
      { title: "Bail application under Section 439 CrPC", type: "Chat" },
      { title: "Legal Notice for recovery of ₹4.2 lakh", type: "Draft" },
      { title: "Adverse possession Section 27 Limitation Act", type: "Chat" },
    ],
  },
  {
    label: "This week",
    items: [
      { title: "Employment agreement — Sr. Software Engineer", type: "Draft" },
      { title: "Compare Kesavananda Bharati vs Minerva Mills", type: "Chat" },
      { title: "Trademark opposition procedure — Section 21", type: "Chat" },
    ],
  },
  {
    label: "Earlier",
    items: [
      { title: "Rental Agreement — 11-month residential", type: "Draft" },
      { title: "Vishaka guidelines summary", type: "Chat" },
      { title: "Partnership Deed — 3 partner firm", type: "Draft" },
    ],
  },
];

function HistoryPage() {
  const [q, setQ] = useState("");
  return (
    <>
      <AppHeader title="History" subtitle="Every conversation and draft, one search away" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative mb-6">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search conversations and drafts…"
              className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm shadow-elegant outline-none focus:border-primary/40"
            />
          </div>

          <div className="space-y-8">
            {groups.map((g) => {
              const items = g.items.filter((i) => i.title.toLowerCase().includes(q.toLowerCase()));
              if (!items.length) return null;
              return (
                <section key={g.label}>
                  <h3 className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                    {g.label}
                  </h3>
                  <div className="overflow-hidden rounded-2xl border border-border bg-card">
                    {items.map((i, idx) => (
                      <div
                        key={i.title}
                        className={`group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/50 ${idx !== 0 ? "border-t border-border" : ""}`}
                      >
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                          {i.type === "Chat" ? <MessageCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{i.title}</div>
                          <div className="text-xs text-muted-foreground">{i.type}</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Rename</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
