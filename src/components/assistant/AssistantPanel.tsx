import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X, Minus, Send, Copy, RefreshCw, Trash2, Scale, BookOpen, Gavel, FileText, ShieldCheck, CornerDownLeft,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AssistantAnswer, AssistantMessage } from "@/lib/assistant-types";
 
const SUGGESTIONS = [
  "What is Section 370 IPC?",
  "Explain Section 138 NI Act",
  "Employment Agreement",
  "Rental Agreement",
  "Legal Notice",
  "Affidavit",
  "Sale Deed",
  "Company Leave Policy",
];
 
const TOPICS = [
  "Acts", "Sections", "Judgments", "Legal Drafts", "Company Policies",
  "HR Policies", "Rental Agreements", "Sale Deeds", "Affidavits",
  "Employment Agreements", "Legal Notices", "Internal Documents",
];
 
const uid = () => `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
 
export default function AssistantPanel({
  onClose,
  onMinimize,
}: {
  onClose: () => void;
  onMinimize: () => void;
}) {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastQuestion = useRef<string>("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
 
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
 
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);
 
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
 
  const ask = useCallback(
    async (question: string, history: AssistantMessage[]) => {
      lastQuestion.current = question;
      setError(null);
      setBusy(true);
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            history: history.slice(-6).map((m) => ({
              role: m.role,
              content: m.role === "user" ? m.text : m.data.answer,
            })),
          }),
        });
        if (!res.ok) throw new Error("request-failed");
        const data = (await res.json()) as AssistantAnswer;
        setMessages((prev) => [...prev, { id: uid(), role: "assistant", at: Date.now(), data }]);
      } catch {
        setError("Unable to connect to JusticeLine AI. Please try again later.");
      } finally {
        setBusy(false);
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [],
  );
 
  const submit = useCallback(
    (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      const userMsg: AssistantMessage = { id: uid(), role: "user", text: q, at: Date.now() };
      setMessages((prev) => {
        const next = [...prev, userMsg];
        void ask(q, prev);
        return next;
      });
      setInput("");
    },
    [ask, busy],
  );
 
  const retry = () => {
    if (lastQuestion.current) void ask(lastQuestion.current, messages);
  };
 
  const clearChat = () => {
    setMessages([]);
    setError(null);
    inputRef.current?.focus();
  };
 
  const isEmpty = messages.length === 0;
 
  return (
    <motion.section
      role="dialog"
      aria-label="JusticeLine AI Assistant"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 24, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 320, damping: 30 }}
      className={cn(
  "fixed inset-0 z-50 flex flex-col overflow-hidden border border-border/60 bg-background/85 backdrop-blur-2xl",
  "sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[520px] sm:w-[340px] sm:rounded-[24px] sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)]",
)}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-brand-gradient px-4 py-3 text-white">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/12 ring-1 ring-white/20">
          <Scale className="h-4 w-4 text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">JusticeLine AI Assistant</p>
          <p className="flex items-center gap-1.5 truncate text-[11px] text-white/70">
            Legal Intelligence Assistant
            <span className="inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online
            </span>
          </p>
        </div>
        <button
          type="button"
          aria-label="Minimize assistant"
          onClick={onMinimize}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/12 hover:text-white"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Close assistant"
          onClick={onClose}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/80 transition-colors hover:bg-white/12 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </header>
 
      {/* Body */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {isEmpty && !busy && !error && (
          <WelcomeScreen onPick={submit} />
        )}
 
        {messages.map((m) =>
          m.role === "user" ? (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-end gap-1"
            >
              <div className="max-w-[85%] rounded-2xl rounded-br-md bg-brand-gradient px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-elegant">
                {m.text}
              </div>
              <span className="pr-1 text-[10px] text-muted-foreground">{fmtTime(m.at)}</span>
            </motion.div>
          ) : (
            <AnswerCard key={m.id} data={m.data} at={m.at} onFollowUp={submit} onClear={clearChat} />
          ),
        )}
 
        {busy && <ThinkingIndicator />}
 
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
          >
            <p className="font-medium text-destructive">Unable to connect to JusticeLine AI.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Please try again later.</p>
            <button
              type="button"
              onClick={retry}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
            >
              <RefreshCw className="h-3 w-3" /> Retry
            </button>
          </motion.div>
        )}
      </div>
 
      {/* Composer */}
      <footer className="sticky bottom-0 border-t border-border/60 bg-background/80 px-3 py-3 backdrop-blur-xl">
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-secondary/40 p-2 transition-colors focus-within:border-primary/40 focus-within:bg-background">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            disabled={busy}
            aria-label="Ask JusticeLine AI Assistant"
placeholder={
  busy
    ? "Searching JusticeLine..."
    : "Ask JusticeLine AI..."
}            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(input);
              }
            }}
            className="max-h-28 min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-60"
          />
          <button
            type="button"
            aria-label="Send message"
            disabled={busy || !input.trim()}
            onClick={() => submit(input)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white shadow-elegant transition-all hover:opacity-95 disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CornerDownLeft className="h-2.5 w-2.5" /> Enter to send · Shift + Enter for a new line
          </p>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearChat}
              className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-2.5 w-2.5" /> Clear chat
            </button>
          )}
        </div>
      </footer>
    </motion.section>
  );
}
 
function WelcomeScreen({ onPick }: { onPick: (q: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 shadow-elegant">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gold/15 blur-2xl" />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient shadow-elegant"
        >
          <Scale className="h-5 w-5 text-gold" />
        </motion.div>
        <h2 className="font-serif text-lg font-semibold">Hello!</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Welcome to JusticeLine AI. I'm your Legal Intelligence Assistant. I help you find legal
          information using JusticeLine's legal database and AI-powered legal intelligence.
        </p>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Ask me about
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/70 bg-secondary/50 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
 
      <div>
        <p className="mb-2 px-1 font-serif text-sm font-semibold">How can I help you today?</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              whileHover={{ scale: 1.03 }}
              onClick={() => onPick(s)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:border-gold/50 hover:bg-gold/5"
            >
              {s}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
 
function ThinkingIndicator() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-gradient">
        <Scale className="h-3.5 w-3.5 text-gold" />
      </div>
      <div className="flex-1 rounded-2xl rounded-tl-md border border-border/70 bg-card p-3 shadow-elegant">
        <p className="flex items-center gap-2 text-xs font-medium">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                className="h-1.5 w-1.5 rounded-full bg-primary"
              />
            ))}
          </span>
          Searching JusticeLine…
        </p>
        <div className="mt-2.5 space-y-1.5">
          {["w-full", "w-[85%]", "w-[60%]"].map((w) => (
            <div key={w} className={cn("h-2 animate-pulse rounded bg-secondary", w)} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
 
function AnswerCard({
  data, at, onFollowUp, onClear,
}: {
  data: AssistantAnswer;
  at: number;
  onFollowUp: (q: string) => void;
  onClear: () => void;
}) {
  const confidenceTone = useMemo(
    () =>
      data.confidence === "High"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "border-gold/40 bg-gold/10 text-gold",
    [data.confidence],
  );
 
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.answer);
      toast.success("Answer copied.");
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };
 
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2">
      <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-gradient">
        <Scale className="h-3.5 w-3.5 text-gold" />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="overflow-hidden rounded-2xl rounded-tl-md border border-border/70 bg-card shadow-elegant">
          <div className="space-y-2.5 p-3.5">
            {data.kind === "general" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <BookOpen className="h-2.5 w-2.5" /> General Legal Information
              </span>
            )}
            {data.answer.split(/\n{2,}/).map((p, i) => (
              <p key={i} className="text-[13px] leading-relaxed text-foreground/90">{p}</p>
            ))}
          </div>
 
          <div className="space-y-3 border-t border-border/70 bg-secondary/25 p-3.5">
            <Block icon={Gavel} label="Related Judgments">
              {data.judgments.length ? (
                <ul className="space-y-1.5">
                  {data.judgments.map((j) => (
                    <li key={j.citation} className="rounded-lg border border-border/60 bg-background px-2.5 py-1.5">
                      <p className="text-[11px] font-medium leading-snug">{j.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {j.citation}{j.court ? ` · ${j.court}` : ""}{j.year ? ` · ${j.year}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  No matching JusticeLine judgments available.
                </p>
              )}
            </Block>
 
            {data.acts.length > 0 && (
              <Block icon={ShieldCheck} label="Related Acts">
                <div className="flex flex-wrap gap-1">
                  {data.acts.map((a) => (
                    <span key={a} className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px]">{a}</span>
                  ))}
                </div>
              </Block>
            )}
 
            {data.documents.length > 0 && (
              <Block icon={FileText} label="Related Documents">
                <div className="flex flex-wrap gap-1">
                  {data.documents.map((d) => (
                    <span key={d} className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[10px]">{d}</span>
                  ))}
                </div>
              </Block>
            )}
 
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] text-muted-foreground">
                Source · <span className="font-medium text-foreground">{data.source}</span>
              </span>
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium", confidenceTone)}>
                Confidence · {data.confidence}
              </span>
            </div>
          </div>
        </div>
 
        {data.followUps.length > 0 && (
          <div className="space-y-1.5">
            <p className="px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Ask a follow-up
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.followUps.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => onFollowUp(f)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] transition-colors hover:border-gold/50 hover:bg-gold/5"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}
 
        <div className="flex items-center gap-3 px-1">
          <span className="text-[10px] text-muted-foreground">{fmtTime(at)}</span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
          >
            <Copy className="h-2.5 w-2.5" /> Copy
          </button>
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-destructive"
          >
            <Trash2 className="h-2.5 w-2.5" /> Clear chat
          </button>
        </div>
      </div>
    </motion.div>
  );
}
 
function Block({
  icon: Icon, label, children,
}: { icon: typeof Gavel; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </p>
      {children}
    </div>
  );
}
 