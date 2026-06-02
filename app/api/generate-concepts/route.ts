import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { buildConceptPrompt, conceptSystemPrompt } from "@/lib/aiPrompts";
import {
  conceptsResponseSchema,
  generateConceptsRequestSchema,
} from "@/lib/schemas";
import {
  createFallbackDesigns,
  normalizeGeneratedDesignList,
} from "@/lib/fallbackDesigns";
import { readJsonWithLimit } from "@/lib/requestLimits";

export const runtime = "nodejs";
export const maxDuration = 60;
const MAX_GENERATE_REQUEST_BYTES = 2_500_000;

export async function POST(request: Request) {
  try {
    const { brandProfile } = generateConceptsRequestSchema.parse(
      await readJsonWithLimit(request, MAX_GENERATE_REQUEST_BYTES),
    );

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        concepts: createFallbackDesigns(brandProfile),
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
          content: buildConceptPrompt(brandProfile),
        },
      ],
      text: {
        format: zodTextFormat(conceptsResponseSchema, "card_concepts"),
      },
      temperature: 0.7,
      max_output_tokens: 2200,
    });

    if (!response.output_parsed) {
      throw new Error("AI did not return valid card concepts.");
    }

    return NextResponse.json({
      concepts: normalizeGeneratedDesignList(
        response.output_parsed.concepts,
        brandProfile,
      ),
      source: "ai",
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate card concepts.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
