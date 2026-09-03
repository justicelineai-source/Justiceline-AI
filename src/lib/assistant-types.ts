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
  title: string;
  citation: string;
  court?: string;
  year?: string;
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
