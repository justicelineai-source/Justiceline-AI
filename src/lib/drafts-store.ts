// Local-storage backed store for draft form data + saved drafts library.

export type DraftFormData = Record<string, string | number | boolean | undefined>;

export type CurrentDraft = {
  slug: string;
  title: string;
  category: string;
  data: DraftFormData;
  updatedAt: string;
};

export type SavedDraft = CurrentDraft & {
  id: string;
  version: number;
  documentNumber: string;
  status: "Draft" | "Reviewed" | "Final";
  pages: number;
  createdAt: string;
};

const CURRENT_KEY = "justiceline.current-draft";
const SAVED_KEY = "justiceline.saved-drafts";
const FORM_KEY_PREFIX = "justiceline.form."; // per-slug form data

export function saveFormData(slug: string, data: DraftFormData) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(FORM_KEY_PREFIX + slug, JSON.stringify(data)); } catch { /* ignore */ }
}

export function loadFormData(slug: string): DraftFormData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FORM_KEY_PREFIX + slug);
    return raw ? (JSON.parse(raw) as DraftFormData) : null;
  } catch { return null; }
}

export function setCurrentDraft(d: CurrentDraft) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CURRENT_KEY, JSON.stringify(d)); } catch { /* ignore */ }
}

export function getCurrentDraft(): CurrentDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as CurrentDraft) : null;
  } catch { return null; }
}

export function listSavedDrafts(): SavedDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedDraft[]) : [];
  } catch { return []; }
}

export function saveDraftToLibrary(d: CurrentDraft): SavedDraft {
  const now = new Date().toISOString();
  const id = `JL-${Date.now().toString(36).toUpperCase()}`;
  const documentNumber = `JL/${new Date().getFullYear()}/${Math.floor(Math.random() * 9000 + 1000)}`;
  const saved: SavedDraft = {
    ...d,
    id,
    version: 1,
    documentNumber,
    status: "Draft",
    pages: 3,
    createdAt: now,
    updatedAt: now,
  };
  const list = listSavedDrafts();
  list.unshift(saved);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  return saved;
}

export function deleteSavedDraft(id: string) {
  const list = listSavedDrafts().filter((d) => d.id !== id);
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch { /* ignore */ }
}
