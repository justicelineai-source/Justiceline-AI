import { createFileRoute, Link, Outlet, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Gavel,
  Users,
  ScrollText,
  Users2,
  Briefcase,
  Search,
  ArrowRight,
  Sparkles,
  Paperclip,
  ArrowUp,
  ChevronDown,
  FileText,
  Clock,
  ExternalLink,
  Scale,
  RotateCcw,
  Copy,
  Check,
  Plus,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { addOrUpdateDraft, loadDrafts, type DraftRecord } from "@/lib/draft-store";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
 
//  Update to this:
export const Route = createFileRoute("/_workspace/draft")({
  head: () => ({
    meta: [
      { title: "Legal Draft · JusticeLine AI" },
      { name: "description", content: "Generate professional legal documents with guided forms." },
      { property: "og:title", content: "Legal Draft Generator · JusticeLine AI" },
      { property: "og:description", content: "Sale Deeds, Affidavits, Notices, Wills and more." },
    ],
  }),
  component: DraftIndex, // Directly loads the Draft UI
});
 
type TemplateItem = { name: string; to: string; featured?: boolean };
type Category = {
  icon: typeof Building2;
  title: string;
  items: TemplateItem[];
};
 
export type DraftHistoryItem = {
  id: string;
  title: string;
  type: string;
  category: string;
  updatedAt: string;
  status: "Draft" | "Ready" | "In Review";
  to: string;
};
 
const categories: Category[] = [
  {
    icon: Building2,
    title: "Property Documents",
    items: [
      { name: "Sale Deed", to: "/draft/sale-deed", featured: true },
      { name: "Gift Deed", to: "/draft/gift-deed" },
      { name: "Lease Deed", to: "/draft/lease-deed" },
      { name: "Rental Agreement", to: "/draft/rental-agreement" },
      { name: "Mortgage Deed", to: "/draft/mortgage-deed" },
      { name: "Partition Deed", to: "/draft/partition-deed" },
      { name: "Relinquishment Deed", to: "/draft/relinquishment-deed" },
      { name: "Settlement Deed", to: "/draft/settlement-deed" },
      { name: "Exchange Deed", to: "/draft/exchange-deed" },
      { name: "Rectification Deed", to: "/draft/rectification-deed" },
      { name: "Release Deed", to: "/draft/release-deed" },
      { name: "Conveyance Deed", to: "/draft/conveyance-deed" },
    ],
  },
  {
    icon: Gavel,
    title: "Court Documents",
    items: [
      { name: "Affidavit", to: "/draft/affidavit" },
      { name: "Legal Notice", to: "/draft/legal-notice" },
      { name: "Petition", to: "/draft/petition" },
      { name: "Appeal", to: "/draft/appeal" },
      { name: "Written Statement", to: "/draft/written-statement" },
      { name: "Counter Affidavit", to: "/draft/counter-affidavit" },
      { name: "Caveat Petition", to: "/draft/caveat-petition" },
      { name: "Bail Application", to: "/draft/bail-application" },
      { name: "Writ Petition", to: "/draft/writ-petition" },
      { name: "Revision Petition", to: "/draft/revision-petition" },
      { name: "Review Petition", to: "/draft/review-petition" },
      { name: "Memo", to: "/draft/memo" },
      { name: "Vakalatnama", to: "/draft/vakalatnama" },
    ],
  },
  {
    icon: Users,
    title: "Business Agreements",
    items: [
      { name: "Employment Agreement", to: "/draft/employment-agreement" },
      { name: "Partnership Agreement", to: "/draft/partnership-agreement" },
      { name: "Non-Disclosure Agreement (NDA)", to: "/draft/nda" },
      { name: "Service Agreement", to: "/draft/service-agreement" },
      { name: "Vendor Agreement", to: "/draft/vendor-agreement" },
      { name: "Consultancy Agreement", to: "/draft/consultancy-agreement" },
      { name: "Franchise Agreement", to: "/draft/franchise-agreement" },
      { name: "Memorandum of Understanding (MoU)", to: "/draft/mou" },
      { name: "Joint Venture Agreement", to: "/draft/joint-venture-agreement" },
      { name: "Shareholders Agreement", to: "/draft/shareholders-agreement" },
      { name: "Software Development Agreement", to: "/draft/software-development-agreement" },
    ],
  },
  {
    icon: ScrollText,
    title: "Personal Documents",
    items: [
      { name: "Will", to: "/draft/will" },
      { name: "Power of Attorney", to: "/draft/power-of-attorney" },
      { name: "Declaration", to: "/draft/declaration" },
      { name: "Name Change Affidavit", to: "/draft/name-change-affidavit" },
      { name: "Marriage Affidavit", to: "/draft/marriage-affidavit" },
      { name: "Divorce Settlement Agreement", to: "/draft/divorce-settlement-agreement" },
      { name: "Adoption Deed", to: "/draft/adoption-deed" },
      { name: "Guardianship Declaration", to: "/draft/guardianship-declaration" },
    ],
  },
  {
    icon: Users2,
    title: "Family Documents",
    items: [
      { name: "Marriage Agreement", to: "/draft/marriage-agreement" },
      { name: "Divorce Petition", to: "/draft/divorce-petition" },
      { name: "Child Custody Petition", to: "/draft/child-custody-petition" },
      { name: "Maintenance Petition", to: "/draft/maintenance-petition" },
      { name: "Succession Certificate Application", to: "/draft/succession-certificate" },
      { name: "Family Settlement Deed", to: "/draft/family-settlement-deed" },
    ],
  },
  {
    icon: Briefcase,
    title: "Company Documents",
    items: [
      { name: "Board Resolution", to: "/draft/board-resolution" },
      { name: "Memorandum of Association (MOA)", to: "/draft/moa" },
      { name: "Articles of Association (AOA)", to: "/draft/aoa" },
      { name: "Employment Offer Letter", to: "/draft/offer-letter" },
      { name: "Appointment Letter", to: "/draft/appointment-letter" },
      { name: "Resignation Acceptance Letter", to: "/draft/resignation-acceptance" },
      { name: "Experience Certificate", to: "/draft/experience-certificate" },
    ],
  },
];
 
const SUGGESTED_PROMPTS = [
  { label: "Create a Sale Deed", to: "/draft/sale-deed" },
  { label: "Draft an Affidavit", to: "/draft/affidavit" },
  { label: "Prepare a Legal Notice", to: "/draft/legal-notice" },
  { label: "Draft a Petition", to: "/draft/petition" },
  { label: "Create a Lease Agreement", to: "/draft/lease-deed" },
  { label: "Draft a Gift Deed", to: "/draft/gift-deed" },
];
 
function DraftLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/draft") return <Outlet />;
  return <DraftIndex />;
}
 
function TemplateRow({ i }: { i: TemplateItem }) {
  return (
    <Link
      to={i.to}
      className="group flex items-center justify-between rounded-lg border border-transparent px-3 py-2.5 text-sm transition-colors hover:border-primary/15 hover:bg-secondary/50"
    >
      <span className="flex items-center gap-2 font-medium text-foreground">
        {i.name}
        {i.featured && (
          <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8a6408]">
            Popular
          </span>
        )}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
 
function DraftIndex() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("auto");
  const [historySearch, setHistorySearch] = useState("");
  const [openCategory, setOpenCategory] = useState<Category | null>(null);
 
  // --- ADD THESE NEW STATES FOR IN-PAGE CHAT ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);
  const [copied, setCopied] = useState(false);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  // ---------------------------------------------
 
  const formatDraftTimestamp = (timestamp: number) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(timestamp));
 
  // Flatten templates for the template selector dropdown
  const allTemplates = useMemo(() => {
    return categories.flatMap((c) =>
      c.items.map((item) => ({ ...item, category: c.title }))
    );
  }, []);
 
  const mapDraftRecordsToHistory = (records: DraftRecord[]): DraftHistoryItem[] =>
    [...records]
      .sort((a, b) => b.timestamp - a.timestamp)
      .map((record) => ({
        id: record.id,
        title: record.title,
        type: record.draftType,
        category: record.category,
        updatedAt: formatDraftTimestamp(record.timestamp),
        status: record.status,
        to: "/draft",
      }));
 
  const [draftHistory, setDraftHistory] = useState<DraftHistoryItem[]>([]);
 
  useEffect(() => {
    setDraftHistory(mapDraftRecordsToHistory(loadDrafts()));
  }, []);
 
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return draftHistory;
    const q = historySearch.toLowerCase();
    return draftHistory.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [draftHistory, historySearch]);
 
  const handleOpenDraft = (draft: DraftHistoryItem) => {
    const record = loadDrafts().find((item) => item.id === draft.id);
    if (!record) return;
 
    setActiveDraftId(record.id);
    setHasStartedChat(true);
    setChatMessages([
      { role: "user", content: `${record.draftType}: ${record.title}` },
      { role: "assistant", content: record.content },
    ]);
    setPrompt("");
 
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
 
  const handleGenerate = async (e: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = (customText ?? prompt).trim();
    if (!query || isGenerating) return;
 
    const matchedTemplate =
      selectedTemplate !== "auto"
        ? allTemplates.find((t) => t.to === selectedTemplate)?.name
        : allTemplates.find((t) =>
            query.toLowerCase().includes(t.name.toLowerCase())
          )?.name;
 
    const draftType = matchedTemplate || "Legal Document";
    const category =
      allTemplates.find((t) => t.to === selectedTemplate)?.category ??
      categories.find((group) =>
        group.items.some((item) => item.name.toLowerCase() === draftType.toLowerCase())
      )?.title ??
      "Legal Draft";
 
    const updated = [...chatMessages, { role: "user" as const, content: query }];
    setChatMessages(updated);
    setHasStartedChat(true);
    setPrompt("");
    setIsGenerating(true);
 
    try {
      const recentHistory = chatMessages
        .slice(-3)
        .map((m) => {
          const content =
            m.content.length > 400
              ? m.content.slice(0, 400) + "... [truncated]"
              : m.content;
          return `${m.role}: ${content}`;
        })
        .join("\n");
 
      const customInstructions = recentHistory
        ? recentHistory.length > 1800
          ? `${recentHistory.slice(0, 1800).trimEnd()}... [truncated]`
          : recentHistory
        : undefined;
 
      const res = await fetch("/api/legal-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftType,
          facts: query,
          parties: {},
          customInstructions,
        }),
      });
 
      const data = await res.json();
 
      if (!res.ok) {
        throw new Error(data.details || data.error || "Drafting request failed");
      }
 
      const answer =
        data.draftContent || data.draft || "Unable to draft document at this time.";
 
      const draftId =
        activeDraftId ?? `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      const newRecord: DraftRecord = {
        id: draftId,
        title: `${draftType} Draft${query.length > 30 ? ` — ${query.slice(0, 30)}...` : ` — ${query}`}`,
        draftType,
        category,
        content: answer,
        timestamp: Date.now(),
        status: "Draft",
      };
 
      const savedDrafts = addOrUpdateDraft(newRecord);
      setDraftHistory(mapDraftRecordsToHistory(savedDrafts));
      setActiveDraftId(draftId);
      setChatMessages([...updated, { role: "assistant", content: answer }]);
    } catch (err: any) {
      setChatMessages([
        ...updated,
        {
          role: "assistant",
          content: `Drafting Error: ${
            err?.message || "Failed to generate draft. Please try again."
          }`,
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };
 
  return (
    <>
      <AppHeader title="Create Legal Draft" subtitle="Choose a template to begin drafting" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Section 1: AI Prompt Creation */}
         {/* Section 1: AI Prompt & In-Page Expansion */}
          <section className="pt-2">
            <div className="text-center">
              <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {hasStartedChat ? "Legal AI Drafting Assistant" : "What legal document do you need to create?"}
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                {hasStartedChat
                  ? "Review, revise, or prompt adjustments to your legal draft below."
                  : "Answer a few guided questions and JusticeLine AI will create a professionally formatted legal draft ready for review."}
              </p>
            </div>
 
            {/* EXPANDED IN-PAGE CHAT THREAD */}
            {hasStartedChat && (
              <div className="mx-auto mt-8 max-w-3xl space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Draft Session
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHasStartedChat(false);
                      setChatMessages([]);
                      setPrompt("");
                      setActiveDraftId(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Draft
                  </button>
                </div>
 
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient text-gold shadow-sm">
                          <Scale className="h-4 w-4" />
                        </div>
                      )}
 
                      <div
                        className={cn(
                          "rounded-2xl p-4 text-sm leading-relaxed",
                          msg.role === "user"
                            ? "max-w-[80%] bg-primary text-primary-foreground shadow-sm"
                            : "w-full border border-border bg-card shadow-sm"
                        )}
                      >
                        {msg.role === "user" ? (
                          msg.content
                        ) : (
                          <div>
                            <div className="mb-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  setCopied(true);
                                  setTimeout(() => setCopied(false), 2000);
                                }}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
                              >
                                {copied ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy Draft
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="prose prose-sm max-w-none text-foreground dark:prose-invert">
  <ReactMarkdown>
    {String(msg.content)}
  </ReactMarkdown>
</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
 
                  {isGenerating && (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground shadow-xs">
                      <div className="h-2 w-2 animate-ping rounded-full bg-primary" />
                      <span>JusticeLine AI is structuring and drafting clauses...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
 
            {/* INPUT PROMPT BOX */}
            <form onSubmit={(e) => handleGenerate(e)} className="mx-auto mt-6 max-w-3xl text-left">
              <div className="group rounded-2xl border border-border bg-card p-3 shadow-elegant transition-all duration-200 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate(e);
                    }
                  }}
                  placeholder={
                    hasStartedChat
                      ? "Request revisions, add clauses, or ask questions about this draft..."
                      : "Describe the legal document you want to create..."
                  }
                  rows={hasStartedChat ? 2 : 3}
                  className="w-full resize-none border-0 bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 sm:text-base"
                />
 
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {!hasStartedChat && (
                      <div className="relative inline-flex items-center">
                        <select
                          aria-label="Select legal document template"
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="h-8 appearance-none rounded-lg border border-border bg-secondary/50 py-1 pl-2.5 pr-7 text-xs font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="auto">Auto-detect Template</option>
                          {categories.map((cat) => (
                            <optgroup key={cat.title} label={cat.title}>
                              {cat.items.map((item) => (
                                <option key={item.to} value={item.to}>
                                  {item.name}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    )}
 
                    <button
  type="button"
  onClick={() => {
    setHasStartedChat(false);
    setChatMessages([]);
    setPrompt("");
    setActiveDraftId(null);
    setSelectedTemplate("auto");
  }}
  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
>
  <Plus className="h-3.5 w-3.5" />
  <span>New Draft</span>
</button>
                  </div>
 
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isGenerating}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
 
              {/* Suggestions (Only displayed before starting chat) */}
              {!hasStartedChat && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  {SUGGESTED_PROMPTS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setPrompt(item.label);
                        setSelectedTemplate(item.to);
                        handleGenerate(null as any, item.label);
                      }}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition hover:border-primary/30 hover:bg-secondary/60 hover:text-foreground"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </section>
 
          {/* Section 2: Legal Draft History */}
          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground">
                  Legal Draft History
                </h2>
                <p className="text-xs text-muted-foreground">
                  View and continue working on your previous legal drafts.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search your legal drafts..."
                  className="h-9 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground shadow-xs focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>
 
            {filteredHistory.length > 0 ? (
              <div className="space-y-3">
                <div className="divide-y divide-border rounded-xl border border-border bg-card shadow-xs">
                  {/* Strictly limits to top 5 drafts */}
                  {filteredHistory.slice(0, 5).map((draft) => (
                    <div
                      key={draft.id}
                      className="flex flex-col gap-3 p-4 transition-colors hover:bg-secondary/30 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-lg border border-border bg-secondary/60 p-2 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{draft.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>{draft.category}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {draft.updatedAt}
                            </span>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">
                              {draft.status}
                            </span>
                          </div>
                        </div>
                      </div>
 
                      <button
                        type="button"
                        onClick={() => handleOpenDraft(draft)}
                        className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-primary hover:underline sm:self-center"
                      >
                        Open Draft
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
 
                {/* View All Button — triggers only when drafts exceed 5 */}
{filteredHistory.length > 0 && (
  <div className="flex justify-center pt-2">
    <Link
      to="/history"
      search={{ filter: "draft" }}
      className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-secondary hover:text-foreground"
    >
      <span>View All in History</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
 
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
                <FileText className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <h3 className="mt-3 text-sm font-semibold text-foreground">No legal drafts yet</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your generated legal documents will appear here.
                </p>
              </div>
            )}
          </section>
 
          {/* Section 3: Document / Template Categories */}
          <section id="template-categories" className="space-y-4">
            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground">
                Document Templates
              </h2>
              <p className="text-xs text-muted-foreground">
                Select a standard legal structure to launch direct field forms.
              </p>
            </div>
 
            <div className="grid gap-6 md:grid-cols-2">
              {categories.map((c) => {
                const visible = c.items.slice(0, 3);
                const totalCount = c.items.length;
                return (
                  <div key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-elegant">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-gold shadow-elegant">
                        <c.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold">{c.title}</h3>
                        <p className="text-xs text-muted-foreground">{totalCount} templates available</p>
                      </div>
                    </div>
                    <ul className="mt-5 space-y-2">
                      {visible.map((i) => (
                        <li key={i.name}>
                          <TemplateRow i={i} />
                        </li>
                      ))}
                    </ul>
                    {totalCount > 3 && (
                      <button
                        type="button"
                        onClick={() => setOpenCategory(c)}
                        className="group mt-4 flex w-full items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-secondary"
                      >
                        <span>View All ({totalCount} Templates)</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
 
      {/* Category View All Dialog */}
      <Dialog open={!!openCategory} onOpenChange={(o) => !o && setOpenCategory(null)}>
        <DialogContent className="max-w-2xl">
          {openCategory && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-gold shadow-elegant">
                    <openCategory.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <DialogTitle className="font-serif text-xl">{openCategory.title}</DialogTitle>
                    <DialogDescription>
                      {openCategory.items.length} templates available
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <ul className="mt-2 grid max-h-[60vh] gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {openCategory.items.map((i) => (
                  <li key={i.name} onClick={() => setOpenCategory(null)}>
                    <TemplateRow i={i} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}