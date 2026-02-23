"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";
import { bestPractices } from "@/data/best-practices";
import { demoPlan } from "@/lib/demo-plan";
import type {
  AuditResult,
  MissionFormState,
  PlannerResponse,
  PlannerResult,
} from "@/lib/types";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const plannerSchema = z.object({
  missionSummary: z
    .string()
    .min(24)
    .max(420)
    .describe("1 paragraph summary referencing hazards, population, urgency."),
  opportunity: z
    .string()
    .min(24)
    .max(360)
    .describe("What leverage point or local asset unlocks outsized impact."),
  signalStrength: z
    .number()
    .min(35)
    .max(100)
    .describe("Confidence percentage 0-100."),
  riskScore: z
    .number()
    .min(25)
    .max(100)
    .describe("Compound risk posture 0-100."),
  resilienceScore: z
    .number()
    .min(25)
    .max(100)
    .describe("Redundancy + safeguards readiness 0-100."),
  phases: z
    .array(
      z.object({
        phase: z.string(),
        window: z.string(),
        outcome: z.string(),
        actions: z.array(
          z.object({
            label: z.string(),
            owner: z.string(),
            detail: z.string(),
          }),
        ),
      }),
    )
    .min(3)
    .max(4),
  supplyThreads: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string(),
        items: z.array(
          z.object({
            name: z.string(),
            quantity: z.string(),
            reason: z.string(),
          }),
        ),
      }),
    )
    .min(2)
    .max(4),
  intel: z
    .array(
      z.object({
        title: z.string(),
        signal: z.enum(["confirmed", "emerging", "watch"]),
        detail: z.string(),
        confidence: z.number().min(20).max(100),
      }),
    )
    .min(3)
    .max(4),
});

export async function generatePlanAction(
  payload: MissionFormState,
): Promise<PlannerResult> {
  if (!process.env.OPENAI_API_KEY) {
    return personalizeFallback(payload);
  }

  try {
    const { object } = await generateObject({
      model: openai("gpt-4.1-mini"),
      temperature: 0.4,
      schema: plannerSchema,
      system:
        "You are ReliefCanvas, an operations chief for humanitarian missions. Respond with decisive, concrete language rooted in logistics, not fluffy text.",
      prompt: buildPrompt(payload),
    });

    const audit = runAudit(payload, object);
    return { plan: object, audit };
  } catch (error) {
    console.error("ReliefCanvas AI error", error);
    return personalizeFallback(payload);
  }
}

function buildPrompt(input: MissionFormState) {
  const focus = input.focus.length ? input.focus.join(", ") : "not specified";
  return `Mission Brief:
Codename: ${input.codename || "Unknown"}
Location: ${input.location || "Unknown"}
Population: ${input.populationFocus || "Not provided"}
Hazard profile: ${input.hazardProfile}
Deployment window: ${input.deploymentWindow}
Assets: ${input.availableAssets}
Constraints: ${input.constraints}
Intel feed: ${input.intelFeed}
Partners: ${input.partners}
Priority pillars: ${focus}
Urgency level: ${input.urgency}/10

Compose a mission summary, highlight a leverage point, and return 3 phases (stabilize, expand, transition) with crisp outcomes and actions. Supply threads should map to real payload bundles. Intel threads should reference the feed and note confidence.`;
}

function runAudit(
  payload: MissionFormState,
  plan: PlannerResponse,
): AuditResult {
  const haystack = [
    payload.availableAssets,
    payload.constraints,
    payload.intelFeed,
    payload.partners,
    plan.missionSummary,
    plan.opportunity,
    plan.phases.map((phase) => `${phase.phase} ${phase.actions
      .map((action) => action.detail)
      .join(" ")}`),
    plan.supplyThreads.map((thread) =>
      thread.items.map((item) => `${item.name} ${item.reason}`).join(" "),
    ),
  ]
    .flat()
    .join(" ")
    .toLowerCase();

  const totalWeight = bestPractices.reduce(
    (acc, practice) => acc + practice.weight,
    0,
  );

  let scored = 0;
  const gaps = bestPractices.map((practice) => {
    const detected = practice.keywords.some((keyword) =>
      haystack.includes(keyword.toLowerCase()),
    );
    if (detected) {
      scored += practice.weight;
    }
    return {
      id: practice.id,
      label: practice.label,
      severity: practice.severity,
      guidance: practice.guidance,
      detected,
    };
  });

  const coverage = Math.round((scored / totalWeight) * 100);

  const highlights = plan.phases
    .flatMap((phase) =>
      phase.actions.slice(0, 1).map((action) => `${phase.phase}: ${action.label}`),
    )
    .slice(0, 3);

  return {
    coverage,
    gaps,
    highlights,
  };
}

function personalizeFallback(payload: MissionFormState): PlannerResult {
  const fallback: PlannerResult = JSON.parse(JSON.stringify(demoPlan));
  fallback.plan.missionSummary = `Mission ${payload.codename || "Unnamed"} in ${
    payload.location || "unspecified location"
  } supporting ${payload.populationFocus || "mixed populations"} while facing ${
    payload.hazardProfile
  }.`;
  fallback.plan.opportunity =
    payload.availableAssets || fallback.plan.opportunity;
  fallback.plan.signalStrength = normalizeNumber(
    45 + payload.urgency * 5 + payload.focus.length * 4,
  );
  fallback.plan.resilienceScore = normalizeNumber(
    40 + payload.focus.length * 6,
  );
  fallback.plan.riskScore = normalizeNumber(70 - payload.focus.length * 2);

  // quick audit to keep UX consistent
  fallback.audit = runAudit(payload, fallback.plan);
  return fallback;
}

function normalizeNumber(value: number) {
  return Math.max(25, Math.min(95, Math.round(value)));
}
