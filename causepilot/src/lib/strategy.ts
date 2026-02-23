import { z } from "zod";

export const strategyRequestSchema = z.object({
  organization: z.string().min(2),
  mission: z.string().min(10),
  audience: z.string().min(3),
  region: z.string().min(2),
  budget: z.string().min(1),
  urgency: z.enum(["now", "quarter", "later"]),
  fieldNotes: z.string().min(25),
  successSignal: z.string().min(5),
  constraints: z.string().optional(),
});

export type StrategyRequest = z.infer<typeof strategyRequestSchema>;

export const strategySchema = z.object({
  missionSummary: z.string(),
  narrativeHook: z.string(),
  donorNarrative: z.array(z.string()).min(1),
  fastFacts: z.array(z.string()).min(1),
  plays: z
    .array(
      z.object({
        name: z.string(),
        insight: z.string(),
        kpi: z.string(),
        actions: z.array(
          z.object({
            label: z.string(),
            detail: z.string(),
            metric: z.string(),
          }),
        ),
      }),
    )
    .min(1),
  runway: z.array(
    z.object({
      phase: z.string(),
      focus: z.string(),
      duration: z.string(),
      owner: z.string(),
      confidence: z.number().min(0).max(1),
    }),
  ),
  experiments: z.array(
    z.object({
      name: z.string(),
      hypothesis: z.string(),
      lift: z.string(),
      effort: z.string(),
    }),
  ),
  signals: z.array(
    z.object({
      metric: z.string(),
      baseline: z.string(),
      target: z.string(),
      instrumentation: z.string(),
    }),
  ),
  riskWatchouts: z.array(z.string()),
  momentumScore: z.number().min(0).max(100),
});

export type Strategy = z.infer<typeof strategySchema>;

export function buildFallbackStrategy(request: StrategyRequest): Strategy {
  const urgencyWeight = request.urgency === "now" ? 0.2 : request.urgency === "quarter" ? 0.12 : 0.07;
  const budgetWeight = request.budget.toLowerCase().includes("m") ? 0.18 : 0.12;
  const narrativeLength = Math.min(request.fieldNotes.length / 280, 1);
  const momentumScore = Math.round(
    (0.35 + urgencyWeight + budgetWeight + narrativeLength * 0.25) * 100,
  );

  return {
    missionSummary: `Create a momentum story for ${request.organization} so ${request.audience} can see how their dollars shift outcomes in ${request.region}.`,
    narrativeHook: `“${request.successSignal}” becomes the north star that keeps ${request.organization} aligned.`,
    donorNarrative: [
      `Ground the donor in the lived reality: ${request.fieldNotes.slice(0, 180)}...`,
      "Translate urgency into a concrete countdown with milestones donors can influence.",
      "Offer a build-measure-learn loop that keeps funders in the cockpit with transparent data.",
    ],
    fastFacts: [
      `Target region: ${request.region}`,
      `Budget window: ${request.budget}`,
      `Primary constraint: ${request.constraints || "Execution capacity"}`,
    ],
    plays: [
      {
        name: "Signal Stack",
        insight: "Donors commit when frontline data is legible within 30 seconds.",
        kpi: "Weekly donor engagement replies",
        actions: [
          {
            label: "Evidence capsule",
            detail: "Distill one field quote + data point into a looping social tile.",
            metric: "Share-through rate",
          },
          {
            label: "Momentum pings",
            detail: "Send 2-sentence wins within 6 hours of each milestone.",
            metric: "Open rate within 2 hrs",
          },
        ],
      },
      {
        name: "Coalition Engine",
        insight: `${request.organization} can borrow trust via hyper-local convenings.`,
        kpi: "Partner-sourced pledges",
        actions: [
          {
            label: "Micro convenings",
            detail: "Host 3 pop-up briefings pairing field staff + beneficiaries.",
            metric: "Avg. pledge per attendee",
          },
        ],
      },
    ],
    runway: [
      {
        phase: "Launch",
        focus: "Prime donors with visceral proof",
        duration: "Weeks 0-3",
        owner: "Story squad",
        confidence: 0.72,
      },
      {
        phase: "Scale",
        focus: "Spin up coalition pledges",
        duration: "Weeks 4-8",
        owner: "Partnerships",
        confidence: 0.64,
      },
      {
        phase: "Lock-in",
        focus: "Convert to multi-year commitments",
        duration: "Weeks 9-12",
        owner: "Executive director",
        confidence: 0.58,
      },
    ],
    experiments: [
      {
        name: "Live donor huddles",
        hypothesis: "If donors co-author commitments live, conversion lifts 22%",
        lift: "22% more closed pledges",
        effort: "Medium",
      },
      {
        name: "Impact receipt",
        hypothesis: "Sending a 48-hour impact receipt cuts churn in half",
        lift: "2x repeat micro-gifts",
        effort: "Low",
      },
    ],
    signals: [
      {
        metric: "Pipeline velocity",
        baseline: "14 days",
        target: "7 days",
        instrumentation: "CRM workflow automation",
      },
      {
        metric: "Credibility mentions",
        baseline: "2 per month",
        target: "6 per month",
        instrumentation: "Media monitoring bot",
      },
    ],
    riskWatchouts: [
      "Founder time becomes bottleneck; pre-record high-fidelity story clips.",
      "Data trust: publish the data dictionary donors can audit.",
    ],
    momentumScore,
  };
}
