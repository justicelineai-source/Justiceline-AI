export type DraftStatus = "Draft" | "Ready" | "In Review";
 
export interface DraftRecord {
  id: string;
  title: string;
  draftType: string;
  category: string;
  content: string;
  timestamp: number;
  status: DraftStatus;
}
 
const STORAGE_KEY = "justiceline_saved_drafts";
 
export function loadDrafts(): DraftRecord[] {
  if (typeof window === "undefined") return [];
 
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
 
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DraftRecord[]) : [];
  } catch {
    return [];
  }
}
 
export function saveDrafts(drafts: DraftRecord[]): void {
  if (typeof window === "undefined") return;
 
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
}
 
export function addOrUpdateDraft(record: DraftRecord): DraftRecord[] {
  const drafts = loadDrafts();
  const existingIndex = drafts.findIndex((draft) => draft.id === record.id);
 
  const nextDrafts =
    existingIndex >= 0
      ? drafts.map((draft) => (draft.id === record.id ? record : draft))
      : [record, ...drafts];
 
  const sorted = [...nextDrafts].sort((a, b) => b.timestamp - a.timestamp);
  saveDrafts(sorted);
  return sorted;
}
 
 