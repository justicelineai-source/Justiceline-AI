import OpenAI from "openai";
import type { AssistantAnswer, RelatedJudgment } from "./assistant-types";
import type { ChatMode } from "./chat-store";

const apiKey =
  process.env.OPENAI_CHAT_API_KEY ||
  process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing OPENAI_API_KEY or OPENAI_CHAT_API_KEY in environment."
  );
}

export const client = new OpenAI({
  apiKey,
});

export type GenerateParams = {
  question: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  records?: any[];
  grounded?: boolean;
  mode: ChatMode;
};

interface JudgmentMetadata {
  id: string | number;
  citation: string;
  principle: string;
  relevance: string;
}

const PRIMARY_MODEL = "gpt-5.6-luna";
const FALLBACK_MODEL = "gpt-4o-mini";

const OPENAI_PROMPT_ID =
  process.env.OPENAI_PROMPT_ID ?? "";

if (!OPENAI_PROMPT_ID) {
  throw new Error(
    "Missing OPENAI_PROMPT_ID in environment."
  );
}

const MODE_INSTRUCTIONS: Record<ChatMode, string> = {
  quick: `
MODE: QUICK ANSWER
- Direct answer in 1–3 sentences.
- 2–5 bullet points for key legal points.
- Mention relevant section/Act briefly if supported.
- Target: 150–400 words.
- Do not turn into a memorandum.
`,

  "deep-search": `
MODE: DEEP SEARCH
- Search and analyze supplied JusticeLine judgment records as primary authority.
- Identify applicable statutory provisions and strongest matching judgments.
- Group by:
  ## Legal Issue
  ## Applicable Law
  ## Relevant JusticeLine Judgments
  ## Analysis
  ## Conclusion.
- Target: 500–1200 words.
`,

  "deep-thinking": `
MODE: DEEP THINKING
- Perform structured legal reasoning.
- Compare authorities and competing arguments.
- Steps:
  Governing rule -> Relevant facts -> Application -> Counterarguments -> Conclusion.
- Target: 700–1600 words.
`,

  "deep-research": `
MODE: DEEP RESEARCH
- Comprehensive legal research memorandum format.
- Sections:
  ## Research Question
  ## Executive Summary
  ## Statutory Framework
  ## Relevant Authorities
  ## Comparative Analysis
  ## Legal Position
  ## Practical Implications
  ## Limitations
  ## Conclusion.
- Target: 1200–2500 words.
`,
};

function formatContextRecords(records: any[]): string {
  if (!records.length) {
    return "No matching JusticeLine records found.";
  }

  return records
    .map(
      (r, i) => `[Record ${i + 1}]
ID: ${r.id ?? ""}
Case No: ${r.CaseNo ?? ""}
Appellant: ${r.Appellant ?? ""}
Respondent: ${r.Respondent ?? ""}
Court: ${r.COURT ?? ""}
Date/Year: ${r.Date ?? r.year ?? ""}
Headnote: ${r.Headnote ?? r.HNote ?? ""}
Acts: ${r.Actreferred ?? ""}
Judgment Snippet: ${
        r.Judgement
          ? String(r.Judgement).slice(0, 1500)
          : "N/A"
      }`
    )
    .join("\n\n---\n\n");
}

async function extractJudgmentMetadata(
  question: string,
  records: any[]
): Promise<JudgmentMetadata[]> {
  if (!records.length) {
    return [];
  }

  const candidateRecords = records
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      caseNo: r.CaseNo ?? null,
      appellant: r.Appellant ?? null,
      respondent: r.Respondent ?? null,
      court: r.COURT ?? null,
      date: r.Date ?? r.year ?? null,
      headnote: r.Headnote ?? r.HNote ?? null,
      acts: r.Actreferred ?? null,
    }));

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
You extract legal research metadata from provided judgment summaries.

Return a valid JSON object with this schema:

{
  "judgments": [
    {
      "id": "original record id",
      "citation": "Official reporter citation or 'Citation not available in JusticeLine record.'",
      "principle": "1-2 sentences on the legal rule or ratio decidendi.",
      "relevance": "1-2 sentences explaining how it answers the user's legal question."
    }
  ]
}

Strict rules:
- Never hallucinate citations.
- Do not confuse Case No with a legal citation.
- Maintain original record IDs.
- Return only valid JSON.
`,
    },
    {
      role: "user",
      content: `Question: ${question}

Records:
${JSON.stringify(candidateRecords)}`,
    },
  ];

  try {
    let response: OpenAI.Chat.ChatCompletion;

    try {
      response =
        await client.chat.completions.create({
          model: PRIMARY_MODEL,
          max_completion_tokens: 2000,
          response_format: {
            type: "json_object",
          },
          messages,
        });
    } catch (modelErr: any) {
      const shouldFallback =
        modelErr?.status === 400 ||
        modelErr?.status === 403 ||
        modelErr?.code === "model_not_found";

      if (!shouldFallback) {
        throw modelErr;
      }

      console.warn(
        `[AI Metadata] Falling back to ${FALLBACK_MODEL}`
      );

      response =
        await client.chat.completions.create({
          model: FALLBACK_MODEL,
          max_tokens: 2000,
          temperature: 0.1,
          response_format: {
            type: "json_object",
          },
          messages,
        });
    }

    const content =
      response.choices[0]?.message?.content || "{}";

    const parsed = JSON.parse(content);

    return Array.isArray(parsed.judgments)
      ? parsed.judgments
      : [];
  } catch (error) {
    console.error(
      "[AI] Metadata extraction failed:",
      error
    );

    return [];
  }
}

async function executeSavedPrompt(
  question: string,
  history: Array<{
    role: "user" | "assistant";
    content: string;
  }>,
  contextText: string,
  modePrompt: string,
  maxTokens: number
): Promise<string> {
  const historyText = history.length
    ? history
        .map((message) => {
          const label =
            message.role === "user"
              ? "User"
              : "Assistant";

          return `${label}: ${message.content}`;
        })
        .join("\n\n")
    : "No previous conversation.";

  const input = `
Previous Conversation:
${historyText}

JusticeLine Retrieved Records:
${contextText}

Current Mode:
${modePrompt}

User Question:
${question}
`;

  const response =
    await client.responses.create({
      prompt: {
        id: OPENAI_PROMPT_ID,
      },
      input,
      max_output_tokens: maxTokens,
    });

  return (
    response.output_text?.trim() ||
    "No answer generated."
  );
}

export async function generateAnswer(
  params: GenerateParams
): Promise<AssistantAnswer> {
  const {
    question,
    history = [],
    records = [],
    grounded = false,
    mode = "quick",
  } = params;

  try {
    const contextText =
      formatContextRecords(records);

    const modePrompt =
      MODE_INSTRUCTIONS[mode] ||
      MODE_INSTRUCTIONS.quick;

    const maxTokens =
      mode === "quick"
        ? 800
        : mode === "deep-search"
        ? 1800
        : mode === "deep-thinking"
        ? 2800
        : 4000;

    console.log(
      "[AI] Using saved OpenAI Prompt:",
      OPENAI_PROMPT_ID
    );

    const runMainSynthesis =
      async (): Promise<string> => {
        return executeSavedPrompt(
          question,
          history,
          contextText,
          modePrompt,
          maxTokens
        );
      };

    /*
      Run the main answer and judgment metadata
      extraction at the same time.
    */
    const [
      rawAnswer,
      metadataList,
    ] = await Promise.all([
      runMainSynthesis(),
      extractJudgmentMetadata(
        question,
        records
      ),
    ]);

    const metadataMap = new Map(
      metadataList.map((metadata) => [
        String(metadata.id),
        metadata,
      ])
    );

    const relatedJudgments: RelatedJudgment[] =
      records.slice(0, 6).map((record) => {
        const title =
          record.Appellant &&
          record.Respondent
            ? `${record.Appellant} v. ${record.Respondent}`
            : record.CaseNo ||
              "Judgment Record";

        const metadata =
          metadataMap.get(
            String(record.id)
          );

        return {
          ...record,
          id: record.id,
          title,

          citation:
            metadata?.citation ||
            "Citation not available in JusticeLine record.",

          court:
            record.COURT ||
            undefined,

          year:
            record.year
              ? Number(record.year)
              : null,

          principle:
            metadata?.principle ||
            "Principle not available in JusticeLine record.",

          relevance:
            metadata?.relevance ||
            "Relevance could not be determined from the JusticeLine record.",
        };
      });

    return {
      answer: rawAnswer,

      kind: grounded
        ? "grounded"
        : "general",

      source:
        "JusticeLine AI Assistant",

      confidence:
        grounded &&
        records.length > 0
          ? "High"
          : "Medium",

      judgments:
        relatedJudgments,

      documents: [],

      acts: records.flatMap(
        (record) =>
          record.Actreferred
            ? [
                String(
                  record.Actreferred
                ),
              ]
            : []
      ),

      followUps: [],
    };
  } catch (error: any) {
    console.error(
      "[JusticeLine AI Error]:",
      error
    );

    return {
      answer: `Unable to complete legal synthesis: ${
        error?.message ||
        "Unknown error"
      }`,

      kind: "general",

      source:
        "JusticeLine AI Assistant",

      confidence: "Low",

      judgments: [],

      documents: [],

      acts: [],

      followUps: [],
    };
  }
}

export default client;