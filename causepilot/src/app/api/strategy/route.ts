import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  buildFallbackStrategy,
  strategyRequestSchema,
  strategySchema,
} from "@/lib/strategy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const parsed = strategyRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      data: buildFallbackStrategy(payload),
      meta: { source: "fallback", notes: "OPENAI_API_KEY missing" },
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt =
    "You are CausePilot, an operator-grade strategist for nonprofit and civic teams. Respond ONLY with JSON matching the schema.";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Mission: ${payload.mission}\nAudience: ${payload.audience}\nRegion: ${payload.region}\nBudget: ${payload.budget}\nUrgency: ${payload.urgency}\nSuccess Signal: ${payload.successSignal}\nConstraints: ${payload.constraints}\nField Notes: ${payload.fieldNotes}`,
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Model returned empty content");
    }

    const rawContent = content as unknown;
    const text =
      typeof rawContent === "string"
        ? rawContent
        : Array.isArray(rawContent)
          ? rawContent
              .map((chunk) => {
                if (typeof chunk === "string") return chunk;
                if (
                  typeof chunk === "object" &&
                  chunk !== null &&
                  "text" in chunk &&
                  typeof chunk.text === "string"
                ) {
                  return chunk.text;
                }
                return "";
              })
              .join("\n")
          : "";

    const parsedContent = strategySchema.safeParse(JSON.parse(text));
    if (!parsedContent.success) {
      throw parsedContent.error;
    }

    return NextResponse.json({
      data: parsedContent.data,
      meta: { source: "openai", usage: completion.usage },
    });
  } catch (error) {
    console.error("Strategy API error", error);
    return NextResponse.json({
      data: buildFallbackStrategy(payload),
      meta: {
        source: "fallback",
        reason: "Upstream error",
        error:
          error instanceof Error ? error.message : "Unknown strategy error",
      },
    });
  }
}
