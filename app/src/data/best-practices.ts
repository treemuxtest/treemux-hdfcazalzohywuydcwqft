export type PracticeCategory =
  | "water"
  | "shelter"
  | "medical"
  | "logistics"
  | "power"
  | "communications";

export interface BestPractice {
  id: string;
  label: string;
  category: PracticeCategory;
  keywords: string[];
  guidance: string;
  weight: number;
  severity: "low" | "medium" | "high";
}

export const bestPractices: BestPractice[] = [
  {
    id: "water-48h",
    label: "48h potable water buffer",
    category: "water",
    keywords: ["water", "hydration", "chlorination", "storage"],
    guidance:
      "Document storage, purification, and contingency suppliers for at least 15L/person/day for 48 hours.",
    weight: 1,
    severity: "high",
  },
  {
    id: "shelter-weatherized",
    label: "Weatherized shelter layouts",
    category: "shelter",
    keywords: ["shelter", "warming", "cooling", "privacy", "layout"],
    guidance:
      "Reference modular shelter layouts with ventilation, privacy corridors, and gender-safe lighting.",
    weight: 0.8,
    severity: "medium",
  },
  {
    id: "medical-tasksharing",
    label: "Task-sharing protocols",
    category: "medical",
    keywords: ["medical", "triage", "task sharing", "scope"],
    guidance:
      "List which allied-health teams can escalate meds, sutures, and obstetric triage when MDs are saturated.",
    weight: 0.9,
    severity: "high",
  },
  {
    id: "logistics-corridors",
    label: "Logistics corridors",
    category: "logistics",
    keywords: ["convoy", "corridor", "border", "customs", "permits"],
    guidance:
      "Map two redundant supply corridors with customs lead times and escort requirements.",
    weight: 0.7,
    severity: "medium",
  },
  {
    id: "power-microgrid",
    label: "Microgrid failover",
    category: "power",
    keywords: ["microgrid", "solar", "generator", "fuel"],
    guidance:
      "Specify 72h generator fuel, solar-hybrid swap plans, and grounding checks for all clinics.",
    weight: 0.6,
    severity: "medium",
  },
  {
    id: "comms-fieldkit",
    label: "Field communications kit",
    category: "communications",
    keywords: ["starlink", "mesh", "radio", "satcom", "comms"],
    guidance:
      "Include spectrum permissions, mesh IDs, and satellite airtime allocations for ops + community hotlines.",
    weight: 0.7,
    severity: "high",
  },
];
