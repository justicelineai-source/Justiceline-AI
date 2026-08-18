import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search, LayoutGrid, List, FileText, Download, Pencil, Trash2, MoreHorizontal,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_workspace/saved")({
  head: () => ({
    meta: [
      { title: "Saved Drafts · JusticeLine AI" },
      { name: "description", content: "Your library of finalised legal drafts." },
      { property: "og:title", content: "Saved Drafts · JusticeLine AI" },
      { property: "og:description", content: "Manage and export your drafts." },
    ],
  }),
  component: SavedPage,
});

const drafts = [
  { title: "Sale Deed — Kapoor v. Mehta", type: "Sale Deed", updated: "22 Jul 2026", pages: 4, tag: "Property" },
  { title: "Legal Notice — Cheque Bounce", type: "Legal Notice", updated: "21 Jul 2026", pages: 2, tag: "Court" },
  { title: "Employment Agreement — Sr. Engineer", type: "Employment", updated: "18 Jul 2026", pages: 6, tag: "Business" },
  { title: "Will — Late Ms. R. Krishnan", type: "Will", updated: "12 Jul 2026", pages: 3, tag: "Personal" },
  { title: "Partnership Deed — Sanghvi & Co.", type: "Partnership", updated: "10 Jul 2026", pages: 5, tag: "Business" },
  { title: "Rental Agreement — 11-month", type: "Rental", updated: "05 Jul 2026", pages: 3, tag: "Property" },
];

const tagColor: Record<string, string> = {
  Property: "bg-primary/10 text-primary",
  Court: "bg-gold/15 text-[#8a6408]",
  Business: "bg-emerald-500/10 text-emerald-700",
  Personal: "bg-sky-500/10 text-sky-700",
};

function SavedPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const items = drafts.filter((d) => d.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <AppHeader title="Saved Drafts" subtitle={`${drafts.length} documents in your library`} />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search drafts…"
                className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm shadow-elegant outline-none focus:border-primary/40"
              />
            </div>
            <div className="flex overflow-hidden rounded-lg border border-border bg-card">
              <button
                onClick={() => setView("grid")}
                className={cn("grid h-11 w-11 place-items-center", view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView("list")}
                className={cn("grid h-11 w-11 place-items-center", view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Link to="/draft">
              <Button className="bg-brand-gradient text-white hover:opacity-95">New Draft</Button>
            </Link>
          </div>

          {view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((d) => (
                <div key={d.title} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-premium">
                  <div className="flex items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-gold shadow-elegant">
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", tagColor[d.tag])}>
                      {d.tag}
                    </span>
                  </div>
                  <h3 className="mt-5 line-clamp-2 font-serif text-base font-semibold">{d.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{d.type} · {d.pages} pages</p>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">Updated {d.updated}</span>
                    <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
              {items.map((d, i) => (
                <div key={d.title} className={cn("flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/50", i !== 0 && "border-t border-border")}>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-muted-foreground">{d.type} · {d.pages} pages · Updated {d.updated}</div>
                  </div>
                  <span className={cn("hidden rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-block", tagColor[d.tag])}>
                    {d.tag}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Pencil className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Download className="mr-2 h-3.5 w-3.5" /> Download</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
