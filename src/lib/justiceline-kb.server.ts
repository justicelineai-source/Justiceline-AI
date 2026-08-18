import type { AssistantAnswer, AssistantSource, RelatedJudgment } from "./assistant-types";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
 
type SearchRecord = {
  id: string | number;
  CaseNo?: string | null;
  Appellant?: string | null;
  Respondent?: string | null;
  Headnote?: string | null;
  HNote?: string | null;
  Judgement?: string | null;
  Actreferred?: string | null;
  COURT?: string | null;
  Date?: string | null;
  citation?: string | null;
};
 
/**
 * Server-side search over JusticeLine Supabase tables. Returns matching judgment records.
 * If no meaningful matches are found, returns an empty array.
 */
export async function searchJusticeLine(query: string): Promise<SearchRecord[]> {
  const term = (query || "").trim();
  if (!term) return [];
 
  // Build OR filters across common judgment fields.
  const filters = [
    `CaseNo.ilike.%${term}%`,
    `Appellant.ilike.%${term}%`,
    `Respondent.ilike.%${term}%`,
    `Headnote.ilike.%${term}%`,
    `HNote.ilike.%${term}%`,
    `Judgement.ilike.%${term}%`,
    `Actreferred.ilike.%${term}%`,
    `COURT.ilike.%${term}%`,
  ];
 
  try {
    console.log("[AI] Supabase search started");
    const { data, error } = await supabaseAdmin
      .from("judgments")
      .select("id, CaseNo, Appellant, Respondent, Headnote, HNote, Judgement, Actreferred, COURT, Date")
      .or(filters.join(","))
      .limit(6);
 
    if (error) {
      console.error("searchJusticeLine supabase error:", error);
      console.log("[AI] Supabase records found: 0");
      return [];
    }
 
    console.log("[AI] Supabase records found:", (data ?? []).length);
 
    return (data ?? []) as SearchRecord[];
  } catch (err) {
    console.error("searchJusticeLine unexpected error:", err);
    console.log("[AI] Supabase records found: 0");
    return [];
  }
}
 
 