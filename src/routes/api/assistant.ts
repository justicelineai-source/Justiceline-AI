import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { generateAnswer } from "@/lib/openai.server";
import { searchJusticeLine } from "@/lib/justiceline-kb.server";

const BodySchema = z.object({
  question: z.string().min(2).max(2000),

  mode: z
    .enum(["quick", "deep-search", "deep-thinking", "deep-research"])
    .default("deep-thinking"),

  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(6000),
      })
    )
    .max(12)
    .optional(),
});

export const Route = createFileRoute("/api/assistant")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = BodySchema.parse(await request.json());

          console.log("[AI] Question received");
          console.log("[AI] Mode:", parsed.mode);
          console.log(
            "[DEBUG] OPENAI_API_KEY exists:",
            Boolean(process.env.OPENAI_API_KEY)
          );

          // Search JusticeLine database
          console.log("[AI] Supabase search started");

          const records = await searchJusticeLine(parsed.question);

          console.log("[AI] Supabase records found:", records.length);

          const grounded = records.length > 0;

          console.log("[AI] Grounded:", grounded);

          // Call OpenAI with the selected mode
          console.log("[AI] OpenAI request started");

          const answer = await generateAnswer({
            question: parsed.question,
            history: parsed.history,
            records,
            grounded,
            mode: parsed.mode,
          });

          console.log("[AI] OpenAI request completed");
          console.log("[AI] Response returned");

          return Response.json(answer);
        } catch (error: any) {
          console.error("[OPENAI ERROR]", error);

          return Response.json(
            {
              error: "OpenAI request failed",
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