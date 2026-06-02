import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { buildRefinePrompt, conceptSystemPrompt } from "@/lib/aiPrompts";
import { locallyRefineGeneratedDesign } from "@/lib/fallbackDesigns";
import { normalizeGeneratedDesign } from "@/lib/generatedCardSafety";
import {
  refineConceptRequestSchema,
  refineConceptResponseSchema,
} from "@/lib/schemas";
import { readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_REFINE_REQUEST_BYTES = 2_500_000;

export async function POST(request: Request) {
  try {
    const { brandProfile, concept, instruction } =
      refineConceptRequestSchema.parse(
        await readJsonWithLimit(request, MAX_REFINE_REQUEST_BYTES),
      );

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        concept: locallyRefineGeneratedDesign(
          brandProfile,
          concept,
          instruction,
        ),
        source: "fallback",
      });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: conceptSystemPrompt,
        },
        {
          role: "user",
          content: buildRefinePrompt(brandProfile, concept, instruction),
        },
      ],
      text: {
        format: zodTextFormat(refineConceptResponseSchema, "refined_concept"),
      },
      temperature: 0.65,
      max_output_tokens: 1500,
    });

    if (!response.output_parsed) {
      throw new Error("AI did not return a valid generated card design.");
    }

    return NextResponse.json({
      concept: normalizeGeneratedDesign(
        response.output_parsed.concept,
        brandProfile,
        concept,
      ),
      source: "ai",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to refine this concept.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
