import OpenAI from "openai";
 
const draftApiKey =
  process.env.OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  process.env.OPENAI_API_KEY;
 
if (!draftApiKey) {
  throw new Error("Missing OPENAI_API_KEY in environment variables.");
}
 
export const draftOpenAI = new OpenAI({
  apiKey: draftApiKey,
});
 
export interface GenerateDraftParams {
  draftType: string;
  parties: {
    petitionerOrPlaintiff?: string;
    respondentOrDefendant?: string;
  };
  facts: string;
  prayer?: string;
  jurisdiction?: string;
  customInstructions?: string;
}
 
export async function generateLegalDraft({
  draftType,
  parties,
  facts,
  prayer,
  jurisdiction = "Appropriate Judicial Forum",
  customInstructions,
}: GenerateDraftParams) {
  // 1. Get the draft-specific Prompt ID from your .env
  const promptId = process.env.OPENAI_DRAFT_PROMPT_ID;
 
  const input = `
DRAFT SPECIFICATIONS:
- Draft Type: ${draftType}
- Jurisdiction / Forum: ${jurisdiction}
- Petitioner/Plaintiff: ${parties.petitionerOrPlaintiff || "[Name]"}
- Respondent/Defendant: ${parties.respondentOrDefendant || "[Name]"}
 
MATERIAL FACTS:
${facts}
 
${prayer ? `RELIEF / PRAYER CLAIMED:\n${prayer}\n` : ""}
${customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ""}
`;
 
  // 2. If you are using OpenAI Saved Prompt IDs:
  if (promptId) {
    const response = await draftOpenAI.responses.create({
      prompt: {
        id: promptId,
      },
      input,
      max_output_tokens: 4000,
    });
 
    return {
      draftType,
      jurisdiction,
      draftContent: response.output_text?.trim() ?? "No draft generated.",
      createdAt: new Date().toISOString(),
    };
  }
 
  // 3. Fallback if promptId is not set in .env
  const response = await draftOpenAI.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert legal conveyancer. Generate a formal legal draft based on the facts provided.",
      },
      {
        role: "user",
        content: input,
      },
    ],
    temperature: 0.1,
  });
 
  return {
    draftType,
    jurisdiction,
    draftContent: response.choices[0]?.message?.content ?? "",
    createdAt: new Date().toISOString(),
  };
}
 