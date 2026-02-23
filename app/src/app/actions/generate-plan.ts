"use server";

import { demoPlan } from "@/lib/demo-plan";
import { MissionFormState, PlannerResult } from "@/lib/types";

export async function generatePlanAction(
  payload: MissionFormState,
): Promise<PlannerResult> {
  // Placeholder implementation until AI pipeline is wired.
  const fallback: PlannerResult = JSON.parse(JSON.stringify(demoPlan));

  // Echo some of the form inputs into the placeholder so the UI feels responsive.
  fallback.plan.missionSummary = `Mission ${payload.codename || "Unnamed"} in ${
    payload.location || "unspecified location"
  } focused on ${payload.populationFocus || "mixed populations"} under ${
    payload.hazardProfile || "compound risks"
  }.`;
  fallback.plan.opportunity =
    payload.availableAssets || fallback.plan.opportunity;
  fallback.plan.signalStrength = Math.min(
    95,
    Math.max(35, 40 + payload.urgency * 6),
  );
  fallback.plan.resilienceScore = Math.min(
    90,
    Math.max(30, 50 + payload.focus.length * 5),
  );
  return fallback;
}
