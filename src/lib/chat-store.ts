export type ChatMsg = { role: "user" | "assistant"; content: string; citations?: string[] };
export type ChatMode = "quick" | "deep-search" | "deep-thinking" | "deep-research";

export type Conversation = {
  id: string;
  title: string;
  messages: ChatMsg[];
  mode: ChatMode;
  updatedAt: number;
};

const KEY = "justiceline.chat.conversations";
const ACTIVE_KEY = "justiceline.chat.activeId";

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch { return []; }
}

export function saveConversations(list: Conversation[]) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* ignore */ }
}

export function getActiveId(): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(ACTIVE_KEY); } catch { return null; }
}

export function setActiveId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch { /* ignore */ }
}

export function newConversation(mode: ChatMode = "deep-thinking"): Conversation {
  return {
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: "New Chat",
    messages: [],
    mode,
    updatedAt: Date.now(),
  };
}

export function timeBucket(ts: number): "Today" | "Yesterday" | "Last week" | "Earlier" {
  const d = new Date(ts);
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (d.getTime() >= startToday) return "Today";
  if (d.getTime() >= startToday - day) return "Yesterday";
  if (d.getTime() >= startToday - 7 * day) return "Last week";
  return "Earlier";
}
