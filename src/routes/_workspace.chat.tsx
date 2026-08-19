import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Plus,
  Search,
  Paperclip,
  Mic,
  ArrowUp,
  Sparkles,
  Scale,
  MessageCircle,
  BookOpen,
  Gavel,
  FileText,
  Zap,
  SearchCheck,
  Brain,
  Library,
  Check,
    ChevronDown,
  HelpCircle,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  loadConversations,
  saveConversations,
  getActiveId,
  setActiveId,
  newConversation,
  timeBucket,
  type Conversation,
} from "@/lib/chat-store";
 
export const Route = createFileRoute("/_workspace/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat · JusticeLine AI" },
      { name: "description", content: "Conversational legal research grounded in cited authority." },
      { property: "og:title", content: "AI Legal Chat · JusticeLine AI" },
      { property: "og:description", content: "Ask about Acts, Sections, and judgments." },
    ],
  }),
  component: ChatPage,
});
 
type Msg = { role: "user" | "assistant"; content: string; citations?: string[] };
 
type ModeId = "quick" | "deep-search" | "deep-thinking" | "deep-research";
type ModeDef = {
  id: ModeId;
  icon: typeof Zap;
  emoji: string;
  title: string;
  description: string;
  bestFor?: string[];
  examples?: string[];
  time: string;
  badge?: { label: string; tone: "default" | "recommended" | "premium" };
};
 
const MODES: ModeDef[] = [
  {
    id: "quick",
    icon: Zap,
    emoji: "⚡",
    title: "Quick Answer",
    description: "Concise, fast answers for straightforward legal questions.",
    examples: ['"What is a Sale Deed?"', '"What is Section 138 NI Act?"'],
    time: "2–5 seconds",
    badge: { label: "Default", tone: "default" },
  },
  {
    id: "deep-search",
    icon: SearchCheck,
    emoji: "🔎",
    title: "Deep Search",
    description: "Searches legal judgments, statutes, and legal references before answering.",
    bestFor: ["Case law", "Judgment research", "Legal precedents"],
    time: "10–20 seconds",
  },
  {
    id: "deep-thinking",
    icon: Brain,
    emoji: "🧠",
    title: "Deep Thinking",
    description: "Detailed legal reasoning with comprehensive analysis.",
    bestFor: ["Complex legal questions", "Legal interpretation", "Opinion drafting"],
    time: "20–40 seconds",
    badge: { label: "Recommended", tone: "recommended" },
  },
  {
    id: "deep-research",
    icon: Library,
    emoji: "📚",
    title: "Deep Research",
    description:
      "Advanced legal research across judgments, Acts, Sections, and multiple sources. Produces structured legal reports with citations.",
    bestFor: ["Legal research", "Case preparation", "Legal opinions", "Research reports"],
    time: "30–60 seconds",
    badge: { label: "Premium", tone: "premium" },
  },
];
 

 
const suggestions = [
  { icon: Gavel, text: "Explain Section 498A IPC with recent judgments" },
  { icon: BookOpen, text: "Summarise the Vishaka guidelines" },
  { icon: FileText, text: "Draft a legal notice for cheque bounce under Section 138 NI Act" },
  { icon: Scale, text: "Compare Kesavananda Bharati and Minerva Mills on basic structure" },
];
 
function ChatPage() {
const [conversations, setConversations] = useState<Conversation[]>([]);
const [activeId, setActiveIdState] = useState<string | null>(null);
const [openMenuId, setOpenMenuId] = useState<string | null>(null);
const [input, setInput] = useState("");
const [messages, setMessages] = useState<Msg[]>([]);
const [pending, setPending] = useState(false);
const [mode, setMode] = useState<ModeId>("deep-thinking");
  const [modalOpen, setModalOpen] = useState(false);
const scrollRef = useRef<HTMLDivElement>(null);

const saveCurrentConversation = (
  updatedMessages: Msg[],
  conversationId?: string
) => {
  setConversations((current) => {
    const id = conversationId ?? activeId;

    // If there is no active conversation yet, create one
    if (!id) {
      const newChat = newConversation(mode);

      const firstUserMessage =
        updatedMessages.find((m) => m.role === "user")?.content ?? "New Chat";

      newChat.title =
        firstUserMessage.length > 50
          ? firstUserMessage.slice(0, 50) + "…"
          : firstUserMessage;

      newChat.messages = updatedMessages;
      newChat.updatedAt = Date.now();

      const updatedList = [newChat, ...current];

      setActiveIdState(newChat.id);
      setActiveId(newChat.id);

      saveConversations(updatedList);

      return updatedList;
    }

    // Update existing conversation
    const updatedList = current.map((conversation) =>
      conversation.id === id
        ? {
            ...conversation,
            messages: updatedMessages,
            updatedAt: Date.now(),
            mode,
          }
        : conversation
    );

    saveConversations(updatedList);

    return updatedList;
  });
};
 const deleteConversation = (conversationId: string) => {
  setConversations((current) => {
    const updatedList = current.filter(
      (conversation) => conversation.id !== conversationId
    );

    saveConversations(updatedList);

    return updatedList;
  });

  if (activeId === conversationId) {
    setActiveIdState(null);
    setActiveId(null);
    setMessages([]);
  }

  setOpenMenuId(null);
};
useEffect(() => {
  const saved = loadConversations();

  setConversations(saved);

  const savedActiveId = getActiveId();

  if (savedActiveId && saved.some((c) => c.id === savedActiveId)) {
    setActiveIdState(savedActiveId);

    const activeConversation = saved.find(
      (c) => c.id === savedActiveId
    );

    if (activeConversation) {
      setMessages(activeConversation.messages as Msg[]);
      setMode(activeConversation.mode as ModeId);
    }
  }
}, []);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);
 
const send = async (text?: string) => {
  const content = (text ?? input).trim();
  if (!content) return;

  const userMessage: Msg = {
    role: "user",
    content,
  };

  const messagesAfterUser = [...messages, userMessage];

  setMessages(messagesAfterUser);
  setInput("");
  setPending(true);

  // Save the user's question immediately

  try {
   const res = await fetch(`/api/assistant`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: content,
    mode,
    history: messages.slice(-6).map((m) => ({
      role: m.role,
      content: m.content,
    })),
  }),
});

    const data = await res.json();

    if (!res.ok || data?.error) {
      const assistantMessage: Msg = {
        role: "assistant",
        content:
          data?.error ??
          "Unable to fetch answer from JusticeLine AI.",
        citations: [],
      };

      const finalMessages = [
        ...messagesAfterUser,
        assistantMessage,
      ];

      setMessages(finalMessages);

      // Save user's question + error response
      saveCurrentConversation(finalMessages);
    } else {
      const citations = (data.judgments ?? []).map(
        (j: any) => j.citation ?? j.title ?? ""
      );

      const assistantMessage: Msg = {
        role: "assistant",
        content: data.answer ?? "",
        citations,
      };

      const finalMessages = [
        ...messagesAfterUser,
        assistantMessage,
      ];

      setMessages(finalMessages);

      // Save user's question + AI answer
      saveCurrentConversation(finalMessages);
    }
  } catch (err) {
    const assistantMessage: Msg = {
      role: "assistant",
      content: "Unable to reach JusticeLine AI.",
      citations: [],
    };

    const finalMessages = [
      ...messagesAfterUser,
      assistantMessage,
    ];

    setMessages(finalMessages);

    // Save conversation even if API fails
    saveCurrentConversation(finalMessages);
  } finally {
    setPending(false);
  }
};
 
  const empty = messages.length === 0;
  const currentMode = MODES.find((m) => m.id === mode)!;
 
  return (
    <div className="flex h-screen min-h-0 flex-1">
      {/* Chat sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border bg-secondary/30 lg:flex">
        <div className="p-4">
  <Button
  onClick={() => {
    setActiveIdState(null);
    setActiveId(null);
    setMessages([]);
    setOpenMenuId(null);
  }}
  className="w-full justify-start gap-2 bg-brand-gradient text-white hover:opacity-95"
>
  <Plus className="h-4 w-4" /> New chat
</Button>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search conversations"
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-xs outline-none focus:border-primary/40"
            />
          </div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-3 pb-4">
          {["Today", "Yesterday", "Last week"].map((group) => (
            <div key={group}>
              <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {group}
              </div>
              <div className="space-y-0.5">
{conversations
  .filter((c) => timeBucket(c.updatedAt) === group)
  .map((c) => (
    <div
      key={c.id}
      className={cn(
        "group relative flex w-full items-center rounded-md transition-colors",
        activeId === c.id
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
      )}
    >
      {/* Conversation */}
      <button
        onClick={() => {
          const selectedConversation = conversations.find(
            (conversation) => conversation.id === c.id
          );

          if (!selectedConversation) return;

          setActiveIdState(selectedConversation.id);
          setActiveId(selectedConversation.id);
          setMessages(selectedConversation.messages as Msg[]);
          setMode(selectedConversation.mode as ModeId);
          setOpenMenuId(null);
        }}
        className="flex min-w-0 flex-1 items-start gap-2 px-2 py-2 text-left text-xs"
      >
        <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />

        <span className="line-clamp-2 leading-snug">
          {c.title}
        </span>
      </button>

      {/* Three-dot menu */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpenMenuId(
            openMenuId === c.id ? null : c.id
          );
        }}
        className="mr-1 grid h-7 w-7 shrink-0 place-items-center rounded-md opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
        aria-label="Conversation options"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Menu */}
      {openMenuId === c.id && (
        <div className="absolute right-1 top-9 z-50 w-36 rounded-lg border border-border bg-card p-1 shadow-lg">
          <button
            type="button"
            onClick={() => deleteConversation(c.id)}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  ))}
              </div>
            </div>
          ))}
        </div>
      </aside>
 
      {/* Main chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">Section 138 NI Act — recent SC interpretation</h1>
            <p className="text-xs text-muted-foreground">JusticeLine AI · Grounded in Indian case law</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live · GPT-4 legal
          </div>
        </div>
 
        <div
  ref={scrollRef}
  className="flex-1 overflow-y-auto pt-0"
>
          {empty ? (
            <div className="mx-auto max-w-2xl px-4 pt-4 pb-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient shadow-premium">
                <Sparkles className="h-6 w-6 text-gold" />
              </div>
              <h2 className="mt-6 font-serif text-2xl font-semibold">How can I help with your research?</h2>
             
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="group inline-flex items-center gap-2 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-medium text-white shadow-premium transition-transform hover:-translate-y-0.5"
                >
                  <HelpCircle className="h-4 w-4 text-gold" />
                  Ask a Question
                </button>
              </div>
<div className="mt-5 grid gap-3 sm:grid-cols-2">                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => send(s.text)}
                    className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                      <s.icon className="h-4 w-4" />
                    </span>
                    <span className="text-foreground">{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-4", m.role === "user" && "justify-end")}>
                  {m.role === "assistant" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient text-gold">
                      <Scale className="h-4 w-4" />
                    </div>
                  )}
                  <div className={cn("min-w-0 max-w-[85%]", m.role === "user" ? "" : "flex-1")}>
                    {m.role === "user" ? (
                      <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                        {m.content}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none text-sm leading-relaxed text-foreground">
                        <ReactMarkdown
  components={{
    h2: ({ children }) => (
      <h2 className="mb-3 mt-6 text-lg font-semibold text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-5 text-base font-semibold text-foreground">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="mb-3 leading-7 text-foreground">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 ml-5 list-disc space-y-1.5">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 ml-5 list-decimal space-y-1.5">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-7">
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">
        {children}
      </strong>
    ),
  }}
>
  {m.content}
</ReactMarkdown>
                        {m.citations && (
                          <div className="mt-4 rounded-lg border border-border bg-secondary/50 p-3">
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-gold">
                              Citations
                            </div>
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {m.citations.map((c) => (
                                <li key={c} className="flex gap-2">
                                  <span className="text-gold">§</span> {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {pending && (
                <div className="flex gap-4">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-gradient text-gold">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                    <span className="ml-2 text-xs text-muted-foreground">Reviewing case law…</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
 
 
 {/* Composer */}
        <div className="border-t border-border bg-background p-4 sm:p-6">
          <div className="mx-auto max-w-3xl">
            {/* Current mode indicator */}
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Current Mode
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5">
                    <span aria-hidden>{currentMode.emoji}</span>
                    <span className="text-foreground">{currentMode.title}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {MODES.map((m) => (
                    <DropdownMenuItem
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className="flex items-start gap-2 py-2"
                    >
                      <span className="mt-0.5" aria-hidden>{m.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          {m.title}
                          {m.id === mode && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground">{m.time}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="relative rounded-2xl border border-border bg-card shadow-elegant transition-shadow focus-within:shadow-premium"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                placeholder="Ask a legal question, cite a section, or paste facts…"
                rows={1}
                className="block w-full resize-none rounded-2xl bg-transparent px-4 py-3.5 pr-16 text-sm outline-none placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between border-t border-border px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-8 w-8">
                    <Mic className="h-4 w-4" />
                  </Button>
                  <span className="ml-1 text-[11px] text-muted-foreground">
                    Grounded in Indian case law · Verify before filing
                  </span>
                </div>
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="h-8 w-8 bg-brand-gradient text-white hover:opacity-95 disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
 
      <ResponseModeDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentMode={mode}
        onContinue={(next) => {
          setMode(next);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
 
function ResponseModeDialog({
  open,
  onOpenChange,
  currentMode,
  onContinue,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  currentMode: ModeId;
  onContinue: (m: ModeId) => void;
}) {
  const [selected, setSelected] = useState<ModeId | null>(null);
 
  useEffect(() => {
    if (open) setSelected(currentMode);
  }, [open, currentMode]);
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        <div className="border-b border-border bg-brand-gradient px-6 py-5 text-white">
          <DialogHeader className="space-y-1.5 text-left">
            <DialogTitle className="font-serif text-xl font-semibold text-white">
              AI Response Mode
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Choose how JusticeLine AI should process your legal query.
            </DialogDescription>
          </DialogHeader>
        </div>
 
        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-6 py-5">
          {MODES.map((m) => {
            const active = selected === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m.id)}
                className={cn(
                  "group flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all",
                  active
                    ? "border-primary bg-primary/5 shadow-elegant"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant",
                )}
              >
                <div
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg",
                    active ? "bg-brand-gradient text-gold" : "bg-primary/5 text-primary",
                  )}
                  aria-hidden
                >
                  <m.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-foreground">
                      <span className="mr-1.5" aria-hidden>{m.emoji}</span>
                      {m.title}
                    </div>
                    {m.badge && <ModeBadge tone={m.badge.tone} label={m.badge.label} />}
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      Est. {m.time}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {m.description}
                  </p>
                  {m.examples && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.examples.map((e) => (
                        <span
                          key={e}
                          className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                  {m.bestFor && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        Best for:
                      </span>
                      {m.bestFor.map((b) => (
                        <span
                          key={b}
                          className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    "mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
                  )}
                  aria-hidden
                >
                  {active && <Check className="h-3 w-3" />}
                </div>
              </button>
            );
          })}
        </div>
 
        <DialogFooter className="gap-2 border-t border-border bg-secondary/40 px-6 py-4 sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selected}
            onClick={() => selected && onContinue(selected)}
            className="bg-brand-gradient text-white hover:opacity-95 disabled:opacity-50"
          >
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 
function ModeBadge({ tone, label }: { tone: "default" | "recommended" | "premium"; label: string }) {
  const cls =
    tone === "recommended"
      ? "bg-primary/10 text-primary border-primary/20"
      : tone === "premium"
        ? "bg-gold/15 text-[#8a6408] border-gold/30"
        : "bg-secondary text-muted-foreground border-border";
  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", cls)}>
      {label}
    </span>
  );
}
 
 