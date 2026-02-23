export type PriorityPillar =
  | "medical"
  | "shelter"
  | "logistics"
  | "power"
  | "water"
  | "communications";

export interface MissionFormState {
  codename: string;
  location: string;
  populationFocus: string;
  hazardProfile: string;
  deploymentWindow: string;
  availableAssets: string;
  constraints: string;
  intelFeed: string;
  partners: string;
  focus: PriorityPillar[];
  urgency: number;
}

export interface PhaseAction {
  label: string;
  owner: string;
  detail: string;
}

export interface MissionPhase {
  phase: string;
  window: string;
  outcome: string;
  actions: PhaseAction[];
}

export interface SupplyThread {
  title: string;
  summary: string;
  items: { name: string; quantity: string; reason: string }[];
}

export interface IntelThread {
  title: string;
  signal: "confirmed" | "emerging" | "watch";
  detail: string;
  confidence: number;
}

export interface PlannerResponse {
  missionSummary: string;
  opportunity: string;
  signalStrength: number;
  riskScore: number;
  resilienceScore: number;
  phases: MissionPhase[];
  supplyThreads: SupplyThread[];
  intel: IntelThread[];
}

export interface AuditGap {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  guidance: string;
  detected: boolean;
}

export interface AuditResult {
  coverage: number;
  gaps: AuditGap[];
  highlights: string[];
}

export interface PlannerResult {
  plan: PlannerResponse;
  audit: AuditResult;
}
