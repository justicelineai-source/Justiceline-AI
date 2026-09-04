import OpenAI from "openai";
import type { AssistantAnswer, RelatedJudgment } from "./assistant-types";
import type { ChatMode } from "./chat-store";
 
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PROMPT_ID = process.env.OPENAI_PROMPT_ID;
 
console.log("[DEBUG] OpenAI API key loaded:", Boolean(OPENAI_KEY));
console.log("[DEBUG] OpenAI Prompt ID loaded:", Boolean(PROMPT_ID));
 
if (!OPENAI_KEY) {
  console.error("[DEBUG] Missing OPENAI_API_KEY");
}
 
if (!PROMPT_ID) {
  console.error("[DEBUG] Missing OPENAI_PROMPT_ID");
}
 
const client = OPENAI_KEY
  ? new OpenAI({ apiKey: OPENAI_KEY })
  : null;
 
type GenerateParams = {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  records?: any[];
  grounded?: boolean;
  mode: ChatMode;
};
type RelatedJudgmentMetadata = {
  id: string | number;
  citation: string;
  principle: string;
  relevance: string;
};
async function generateRelatedJudgmentMetadata(
  question: string,
  records: any[],
): Promise<RelatedJudgmentMetadata[]> {
  if (!records.length) return [];

  if (!client) return [];

  const metadataInput = records.slice(0, 6).map((record) => ({
    id: record.id,
    caseNo: record.CaseNo ?? null,
    appellant: record.Appellant ?? null,
    respondent: record.Respondent ?? null,
    court: record.COURT ?? null,
    date: record.Date ?? null,
    year: record.year ?? null,
    headnote: record.Headnote ?? record.HNote ?? null,
    judgment: record.Judgement ?? null,
    acts: record.Actreferred ?? null,
  }));

  const metadataPrompt = `
You are preparing concise legal research metadata for judgments
retrieved from the JusticeLine judgment database.

User's legal question:
${question}

JusticeLine judgment records:
${JSON.stringify(metadataInput, null, 2)}

For EACH judgment, return:

1. citation
2. principle
3. relevance

STRICT RULES:

- Use ONLY the information contained in the supplied JusticeLine records.
- Never invent a citation.
- If a reliable legal citation is not present in the supplied record,
  return exactly:
  "Citation not available in JusticeLine record."
- The principle must briefly explain the legal rule, holding, or
  important proposition actually supported by the judgment record.
- The relevance must explain why THIS PARTICULAR judgment is relevant
  to the user's legal question.
- Do not invent facts, holdings, dates, statutory provisions, or citations.
- Do not confuse the case number with a legal reporter citation.
- Keep each principle concise, approximately 1–3 sentences.
- Keep each relevance concise, approximately 1–2 sentences.
- Return ONLY valid JSON.
- Do not use Markdown.
- Preserve the supplied database ID exactly.

Return exactly:

[
  {
    "id": "database id",
    "citation": "...",
    "principle": "...",
    "relevance": "..."
  }
]
`;

  try {
    const response = await client.responses.create({
      model: "gpt-5.5",
      input: metadataPrompt,
      max_output_tokens: 3000,
    });

    const raw = response.output_text?.trim() || "[]";

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          item.id !== undefined &&
          item.id !== null,
      )
      .map((item) => ({
        id: item.id,
        citation:
          typeof item.citation === "string"
            ? item.citation
            : "Citation not available in JusticeLine record.",
        principle:
          typeof item.principle === "string"
            ? item.principle
            : "Principle not available in JusticeLine record.",
        relevance:
          typeof item.relevance === "string"
            ? item.relevance
            : "Relevance could not be determined from the JusticeLine record.",
      }));
  } catch (error) {
    console.error(
      "[AI] Related judgment metadata generation failed:",
      error,
    );

    return [];
  }
}
export async function generateAnswer(
  params: GenerateParams
): Promise<AssistantAnswer> {
  if (!client) {
    throw new Error("OpenAI API key not configured");
  }
 
  if (!PROMPT_ID) {
    throw new Error("OPENAI_PROMPT_ID not configured");
  }
 
 const {
  question,
  history = [],
  records = [],
  grounded = false,
  mode,
} = params;
 
  const contextText =
  records.length > 0
    ? records
        .map(
          (r, i) =>
            `Record ${i + 1}
Database ID: ${r.id ?? ""}
Keycode: ${r.Keycode ?? ""}
Case No: ${r.CaseNo ?? ""}
Appellant: ${r.Appellant ?? ""}
Respondent: ${r.Respondent ?? ""}
Court: ${r.COURT ?? ""}
Judges: ${r.Judges ?? ""}
Bench: ${r.Bench ?? ""}
Date: ${r.Date ?? ""}
Year: ${r.year ?? ""}
Headnote: ${r.Headnote ?? ""}
Judgment: ${r.Judgement ?? ""}
Acts: ${r.Actreferred ?? ""}`
        )
        .join("\n\n")
    : "No matching JusticeLine judgment records were found.";
 const modeInstructions: Record<ChatMode, string> = {
  quick: `
MODE: QUICK ANSWER
 
Purpose:
Provide the fastest useful answer to a straightforward legal question.
 
Behavior:
- Answer the user's exact question immediately.
- Do not perform an extensive case-law analysis.
- Use JusticeLine records when they directly answer the question.
- If relevant records exist, mention only the most relevant authority or provision.
- Do not list multiple judgments unless necessary.
- Do not provide a long legal research discussion.
- Keep the answer concise.
 
Preferred structure:
 
## Short Answer
 
Give the direct answer in 1–3 sentences.
 
## Key Points
 
Use 2–5 bullet points when useful.
 
## Relevant Provision
 
Mention the relevant section/Act briefly if supported.
 
## Conclusion
 
Give one short concluding statement.
 
Target length:
Approximately 150–400 words unless the question requires more.
 
Do not turn a simple question into a research memorandum.
`,
 
  "deep-search": `
MODE: DEEP SEARCH
 
Purpose:
Search and analyze the supplied JusticeLine judgment records to find the most relevant legal authorities for the user's question.
 
Behavior:
- Treat the supplied JusticeLine records as the primary research source.
- Identify the most relevant statutory provisions.
- Identify the strongest matching judgments.
- Extract the legal principle actually supported by those records.
- Explain why each selected judgment is relevant.
- Prefer a small number of highly relevant authorities over a long list.
- Distinguish between what the records expressly establish and what is only an inference.
- Do not invent missing facts, citations, dates, holdings, or statutory wording.
 
Preferred structure:
 
## Legal Issue
 
State the precise legal question.
 
## Applicable Law
 
List the relevant statutory provisions.
 
## Relevant JusticeLine Judgments
 
For each important judgment:
- **Case name**
- Citation/case number if available
- Court/date if available
- Key principle
- Why it is relevant
 
## Analysis
 
Explain how the retrieved authorities apply to the question.
 
## Conclusion
 
Give the legal position supported by the retrieved JusticeLine material.
 
Target length:
Approximately 500–1200 words depending on the amount of relevant material.
 
Important:
This mode is primarily about FINDING and ORGANIZING the most relevant JusticeLine authorities.
Do not merely produce a longer version of Quick Answer.
`,
 
  "deep-thinking": `
MODE: DEEP THINKING
 
Purpose:
Perform structured legal reasoning rather than simply summarizing search results.
 
Behavior:
- Carefully identify the legal issue.
- Break the issue into its individual legal questions.
- Identify the governing statutory provisions.
- Analyze the relevant JusticeLine judgments.
- Compare the reasoning of different authorities where appropriate.
- Examine competing interpretations or factual considerations when supported by the records.
- Explain the reasoning connecting the legal rule to the facts or issue.
- Clearly distinguish established legal principles from analytical inference.
- Do not invent authorities, facts, statutory language, or holdings.
 
Preferred structure:
 
## Legal Issue
 
What exactly must be decided?
 
## Applicable Law
 
What statutory provisions govern the issue?
 
## Relevant Authorities
 
Identify the strongest JusticeLine cases and explain their holdings.
 
## Legal Reasoning
 
Analyze the issue step by step.
 
Where appropriate, discuss:
1. The governing rule
2. The relevant facts or evidence
3. Application of the rule
4. Counterarguments or competing interpretations
5. Why one interpretation is stronger
 
## Conclusion
 
State the reasoned legal conclusion.
 
Target length:
Approximately 700–1600 words depending on complexity.
 
Important:
This mode should demonstrate REASONING and COMPARISON.
It should not simply repeat the search results.
`,
 
  "deep-research": `
MODE: DEEP RESEARCH
 
Purpose:
Produce a comprehensive research-style legal analysis using the available JusticeLine material.
 
Behavior:
- Examine all relevant supplied JusticeLine records.
- Identify the applicable statutory framework.
- Identify multiple relevant authorities where available.
- Group authorities by legal issue or principle.
- Compare authorities where they address similar or different questions.
- Identify consistent principles and any apparent differences.
- Explain the development or application of the legal principle only when supported by the supplied material.
- Synthesize the authorities instead of merely listing them.
- Clearly identify limitations in the available JusticeLine database.
- Never fabricate authorities, citations, dates, holdings, statutory provisions, or facts.
 
Preferred structure:
 
## Research Question
 
Clearly state the research problem.
 
## Executive Summary
 
Give the main legal position in a concise form.
 
## Statutory Framework
 
Explain all relevant statutory provisions.
 
## Relevant Authorities
 
Organize the important cases by issue.
 
For each authority include:
- **Case**
- Court
- Date
- Citation/case number
- Relevant facts if available
- Legal principle
- Relevance
 
## Comparative Analysis
 
Compare the authorities and identify:
- common principles
- differences
- factual distinctions
- conflicting approaches, if actually present
 
## Legal Position
 
Synthesize what the JusticeLine material establishes.
 
## Practical Implications
 
Explain what the legal position means in practice.
 
## Limitations
 
State what the supplied database does not establish.
 
## Conclusion
 
Give the final research conclusion.
 
Target length:
Approximately 1200–2500 words when sufficient material exists.
 
Important:
This mode should resemble a professional legal research memorandum.
It must be substantially more comprehensive than Deep Search.
`,
};
const userInput = `
CURRENT RESPONSE MODE:
${mode}
 
MODE-SPECIFIC INSTRUCTIONS:
${modeInstructions[mode]}
 
Question:
${question}
 
JusticeLine Database Context:
${contextText}
 
Conversation History:
${
  history.length > 0
    ? JSON.stringify(history)
    : "No previous conversation."
}
 
Grounded in JusticeLine database:
${grounded ? "Yes" : "No"}
 
Important:
- JusticeLine database records are the primary source when available.
- Do not invent legal authorities, citations, case names, dates, sections, or facts.
- Clearly distinguish database-grounded information from general legal information.
- Follow the selected mode instructions when generating the answer.
 
OUTPUT FORMAT:
- Return ONLY the main legal answer.
- Format the answer using clean Markdown.
- Put every heading on its own line.
- Leave a blank line before and after every heading.
- Use short paragraphs.
- Use bullet points where appropriate.
- Use numbered lists for legal tests, steps, or requirements.
- Use bold text for important legal terms, sections, and case names.
 
DO NOT include these sections inside the answer:
- Related Judgments
- Related Acts
- Related Documents
- Source
- Confidence
- Suggested Follow-up Questions
 
DO NOT include:
- Copy
- Ask Follow-Up
- Clear Chat
- JSON
- Code fences
- UI instructions
 
Those items are handled separately by the JusticeLine interface.
`;
 
  try {
    console.log("[DEBUG] Calling OpenAI Responses API");
    console.log("[DEBUG] Prompt ID:", PROMPT_ID);
 console.log("[AI] SELECTED MODE:", mode);
console.log("[AI] MODE INSTRUCTIONS:", modeInstructions[mode]);
const response = await client.responses.create({
  model: "gpt-5.5",
 
  prompt: {
    id: PROMPT_ID,
    version: "1",
  },
 
  input: userInput,
 
  max_output_tokens:
  mode === "quick"
    ? 600
    : mode === "deep-search"
      ? 1800
      : mode === "deep-thinking"
        ? 2800
        : 4000,
});
 
    console.log("[DEBUG] OpenAI response received");
 
    const raw = response.output_text ?? "";
 
    console.log(
      "[DEBUG] OpenAI output:",
      raw.slice(0, 1000)
    );
 
    let output: any;
 
    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
 
      output = JSON.parse(cleaned);
    } catch {
      output = {
        answer: raw,
        judgments: [],
        acts: [],
        documents: [],
        followUps: [],
      };
    }
 const metadata = await generateRelatedJudgmentMetadata(
  question,
  records,
);

const metadataMap = new Map(
  metadata.map((item) => [String(item.id), item]),
);

const relatedJudgments: RelatedJudgment[] = records
  .slice(0, 6)
  .map((record: any) => {
    const title =
      record.Appellant && record.Respondent
        ? `${record.Appellant} v. ${record.Respondent}`
        : record.CaseNo || "Judgment";

    const generated = metadataMap.get(String(record.id));

    return {
      ...record,

      id: record.id,

      title,

      citation:
        generated?.citation ||
        "Citation not available in JusticeLine record.",

      court: record.COURT || undefined,

      year:
        record.year !== null && record.year !== undefined
          ? Number(record.year)
          : null,

      principle:
        generated?.principle ||
        "Principle not available in JusticeLine record.",

      relevance:
        generated?.relevance ||
        "Relevance could not be determined from the JusticeLine record.",
    };
  });
   const answer: AssistantAnswer = {
  answer:
    output.answer ??
    output.text ??
    raw,
 
  kind: grounded ? "grounded" : "general",
 
  source: "JusticeLine AI Assistant",
 
  confidence: grounded ? "High" : "Medium",
 
  // Use the REAL Supabase judgment records.
  // Do not depend on OpenAI to recreate them.
judgments: relatedJudgments, 
  documents: Array.isArray(output.documents)
    ? output.documents
    : [],
 
  acts: Array.isArray(output.acts)
    ? output.acts
    : [],
 
  followUps: Array.isArray(output.followUps)
    ? output.followUps.slice(0, 3)
    : [],
};
 
    return answer;
  } catch (error: any) {
    console.error("[OPENAI ERROR]", error);
 
    return {
      answer: `OpenAI error: ${
        error?.message ?? String(error)
      }`,
      kind: "general",
      source: "JusticeLine AI Assistant",
      confidence: "Low",
      judgments: [],
      documents: [],
      acts: [],
      followUps: [],
    };
  }
}
 
export default client;
 
 