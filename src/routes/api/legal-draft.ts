import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateLegalDraft } from "@/lib/legal-draft.server";
 
const DraftBodySchema = z.object({
  draftType: z.string().min(1).max(200),
  jurisdiction: z.string().max(300).optional(),
  parties: z
    .object({
      petitionerOrPlaintiff: z.string().max(500).optional(),
      respondentOrDefendant: z.string().max(500).optional(),
    })
    .default({}),
  facts: z.string().min(1).max(50000),
  prayer: z.string().max(10000).optional(),
  // Change .max(2000) to .max(20000) or remove .max() entirely:
  customInstructions: z.string().max(20000).optional(),
});
 
export const Route = createFileRoute("/api/legal-draft")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = DraftBodySchema.parse(body);
 
          console.log("[Legal Draft] Request received for:", parsed.draftType);
          console.log(
            "[DEBUG] Draft Key active:",
            Boolean(process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY)
          );
 
          const result = await generateLegalDraft({
            draftType: parsed.draftType,
            jurisdiction: parsed.jurisdiction,
            parties: parsed.parties,
            facts: parsed.facts,
            prayer: parsed.prayer,
            customInstructions: parsed.customInstructions,
          });
 
          return Response.json(result);
        } catch (error: any) {
          console.error("[DRAFT API ERROR]", error);
          return Response.json(
            {
              error: "Draft generation failed",
              details:
                process.env.NODE_ENV === "development"
                  ? error?.message || String(error)
                  : undefined,
            },
            { status: 502 }
          );
        }
      },
    },
  },
});
 