export type AssistantSource =
  | "JusticeLine Judgment Database"
  | "JusticeLine Knowledge Base"
  | "JusticeLine Legal News"
  | "JusticeLine Internal Documents"
  | "JusticeLine HR Policies"
  | "JusticeLine Draft Templates"
  | "JusticeLine AI Assistant";

export type Confidence = "High" | "Medium" | "Low";

export type RelatedJudgment = {
  id: string | number;

  // Display fields
  title: string;
  citation: string;
  court?: string;
  year?: string;
  principle?: string;
  relevance?: string;

  // Original JusticeLine judgment fields
  Keycode?: number | null;
  COURT?: string | null;
  Judges?: string | null;
  Bench?: string | number | null;
  CaseNo?: string | null;
  Appellant?: string | null;
  Respondent?: string | null;
  Headnote?: string | null;
  HNote?: string | null;
  Judgement?: string | null;
  Actreferred?: string | null;
  Date?: string | null;
  Result?: string | null;
  Advocates?: string | null;
};

export type AssistantAnswer = {
  answer: string;
  kind: "grounded" | "general";
  source: AssistantSource;
  confidence: Confidence;
  judgments: RelatedJudgment[];
  documents: string[];
  acts: string[];
  followUps: string[];
};

export type AssistantMessage =
  | { id: string; role: "user"; text: string; at: number }
  | { id: string; role: "assistant"; at: number; data: AssistantAnswer };
