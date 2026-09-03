import { supabaseAdmin } from "@/integrations/supabase/client.server";
 
type SearchRecord = {
  id: string | number;
 
  Keycode?: number | null;
  COURT?: string | null;
  Judges?: string | null;
  Bench?: string | null;
  CaseNo?: string | null;
  Appellant?: string | null;
  Respondent?: string | null;
  Headnote?: string | null;
  HNote?: string | null;
  Judgement?: string | null;
  Actreferred?: string | null;
  Date?: string | null;
  Result?: string | null;
  year?: number | null;
};
 
export async function searchJusticeLine(
  query: string
): Promise<SearchRecord[]> {
  const term = (query || "").trim();
 
  if (!term) {
    return [];
  }
 
  console.log("[AI] Supabase search started");
  console.log("[AI] Original query:", term);
 
  try {
    const db = supabaseAdmin as any;
 
    /*
     * Extract useful legal search terms from the user's
     * natural-language question.
     */
    const words = term
      .replace(/[?.,;:()[\]{}"'`]/g, " ")
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length >= 3)
      .filter(
        (word) =>
          ![
            "what",
            "what's",
            "what’s",
            "explain",
            "tell",
            "about",
            "give",
            "please",
            "does",
            "under",
            "with",
            "from",
            "this",
            "that",
            "which",
            "when",
            "where",
            "how",
            "the",
            "and",
            "for",
            "are",
            "was",
            "can",
            "could",
            "would",
          ].includes(word.toLowerCase())
      );
 
    console.log("[AI] Search keywords:", words);
 
    if (words.length === 0) {
      return [];
    }
 
    /*
     * Search each useful keyword independently.
     *
     * Results are stored in a Map so duplicate
     * judgments are removed automatically.
     */
    const resultsMap = new Map<string | number, SearchRecord>();
 
    for (const word of words.slice(0, 6)) {
      const filters = [
        `CaseNo.ilike.%${word}%`,
        `Appellant.ilike.%${word}%`,
        `Respondent.ilike.%${word}%`,
        `Headnote.ilike.%${word}%`,
        `HNote.ilike.%${word}%`,
        `Judgement.ilike.%${word}%`,
        `Actreferred.ilike.%${word}%`,
        `COURT.ilike.%${word}%`,
      ];
 
      const { data, error } = await db
        .from("judgments")
        .select(
          "id, Keycode, COURT, Judges, Bench, CaseNo, Appellant, Respondent, Headnote, HNote, Judgement, Actreferred, Date, Result, year"
        )
        .or(filters.join(","))
        .limit(6);
 
      if (error) {
        console.error(
          `[AI] Supabase search error for "${word}":`,
          error
        );
        continue;
      }
 
      for (const record of data ?? []) {
        if (record?.id !== undefined && record?.id !== null) {
          resultsMap.set(record.id, record as SearchRecord);
        }
      }
    }
 
    /*
     * Return maximum 6 unique judgments.
     */
    const results = Array.from(resultsMap.values()).slice(0, 6);
 
    console.log("[AI] Supabase records found:", results.length);
 
    return results;
  } catch (error) {
    console.error(
      "[AI] Supabase search unexpected error:",
      error
    );
 
    return [];
  }
}
 