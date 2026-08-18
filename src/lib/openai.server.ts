import OpenAI from "openai";
import type { AssistantAnswer, RelatedJudgment } from "./assistant-types";
 
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
  history?: {
    role: "user" | "assistant";
    content: string;
  }[];
  records?: any[];
  grounded?: boolean;
};
 
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
  } = params;
 
  const contextText =
    records.length > 0
      ? records
          .map(
            (r, i) =>
              `Record ${i + 1}
Case No: ${r.CaseNo ?? ""}
Appellant: ${r.Appellant ?? ""}
Respondent: ${r.Respondent ?? ""}
Court: ${r.COURT ?? ""}
Date: ${r.Date ?? ""}
Headnote: ${r.Headnote ?? ""}
Judgment: ${r.Judgement ?? ""}
Acts: ${r.Actreferred ?? ""}`
          )
          .join("\n\n")
      : "No matching JusticeLine judgment records were found.";
 
  const userInput = `
Question:
${question}
 
JusticeLine Database Context:
${contextText}
 
Conversation History:
${history.length > 0 ? JSON.stringify(history) : "No previous conversation."}
 
Grounded in JusticeLine database:
${grounded ? "Yes" : "No"}
 
Answer the user's question according to the instructions in the JusticeLine AI prompt.
`;
 
  try {
    console.log("[DEBUG] Calling OpenAI Responses API");
    console.log("[DEBUG] Prompt ID:", PROMPT_ID);
 
    const response = await client.responses.create({
      model: "gpt-5.5",
 
      // IMPORTANT:
      // prompt must be an OBJECT, not an array.
      prompt: {
        id: PROMPT_ID,
      },
 
      input: userInput,
 
      max_output_tokens: 1200,
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
 
    const answer: AssistantAnswer = {
      answer:
        output.answer ??
        output.text ??
        raw,
 
      kind: grounded ? "grounded" : "general",
 
      source: "JusticeLine AI Assistant",
 
      confidence: grounded ? "High" : "Medium",
 
      judgments: Array.isArray(output.judgments)
        ? (output.judgments as RelatedJudgment[])
        : [],
 
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
 