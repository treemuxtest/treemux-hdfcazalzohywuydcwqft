"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generatePlanAction } from "@/app/actions/generate-plan";
import type {
  MissionFormState,
  MissionHistoryItem,
  PlannerResult,
  PriorityPillar,
} from "@/lib/types";
import { bestPractices } from "@/data/best-practices";

const priorityOptions: { label: string; value: PriorityPillar }[] = [
  { label: "Medical surge", value: "medical" },
  { label: "Shelter", value: "shelter" },
  { label: "Logistics", value: "logistics" },
  { label: "Water", value: "water" },
  { label: "Power", value: "power" },
  { label: "Comms", value: "communications" },
];

const hazardProfiles = [
  "Cyclone + flooding",
  "Earthquake",
  "Conflict displacement",
  "Heat emergency",
  "Public health outbreak",
];

const HISTORY_KEY = "reliefcanvas.history.v1";

const readLocalHistory = (): MissionHistoryItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as MissionHistoryItem[]) : [];
  } catch {
    return [];
  }
};

const initialForm: MissionFormState = {
  codename: "Aurelia Coast",
  location: "Bicol, Philippines",
  populationFocus: "12k evacuees split between coastal + upland barangays",
  hazardProfile: "Cyclone + flooding",
  deploymentWindow: "Feb 23-26, 2026",
  availableAssets:
    "Local co-op cold chain, barangay nurses, one Starlink dish, 6 water trucks.",
  constraints:
    "Route 03 landslide, diesel ration rumors, shelters missing privacy zones.",
  intelFeed:
    "Cholera uptick reported; landslide watchers flagged; diaspora ready to wire funds.",
  partners: "Red Cross Bicol, Coastline Co-ops, Radio Bataan volunteers.",
  focus: ["medical", "water", "communications"],
  urgency: 6,
};

export function MissionPlanner() {
  const [formState, setFormState] = useState<MissionFormState>(initialForm);
  const [result, setResult] = useState<PlannerResult | null>(null);
  const [history, setHistory] = useState<MissionHistoryItem[]>(readLocalHistory);
  const [sharedHistory, setSharedHistory] = useState<MissionHistoryItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    getSharedHistory()
      .then((data) => setSharedHistory(data))
      .catch(() => {});
  }, []);

  const handleToggle = (pillar: PriorityPillar) => {
    setFormState((prev) => {
      const exists = prev.focus.includes(pillar);
      return {
        ...prev,
        focus: exists
          ? prev.focus.filter((item) => item !== pillar)
          : [...prev.focus, pillar],
      };
    });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const missionSnapshot = {
      codename: formState.codename,
      location: formState.location,
    };
    startTransition(async () => {
      try {
        const next = await generatePlanAction(formState);
        setResult(next);
        await persistHistory(next, missionSnapshot);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to craft plan. Try again in a moment.",
        );
      }
    });
  };

  const persistHistory = async (
    next: PlannerResult,
    missionSnapshot: { codename: string; location: string },
  ) => {
    if (typeof window === "undefined") return;
    const entry: MissionHistoryItem = {
      codename: missionSnapshot.codename || "Untitled",
      location: missionSnapshot.location || "Unknown AO",
      coverage: next.audit.coverage,
      timestamp: Date.now(),
    };
    setHistory((prev) => {
      const filtered = prev.filter(
        (item) => item.codename !== entry.codename || item.location !== entry.location,
      );
      const updated = [entry, ...filtered].slice(0, 4);
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });

    try {
      await postSharedHistory(entry);
      const remoteHistory = await getSharedHistory();
      setSharedHistory(remoteHistory);
    } catch {
      // API failures should not break the flow
    }
  };

  const coverageByCategory = useMemo(() => {
    if (!result) return [];
    return bestPractices.map((practice) => {
      const hit = result.audit.gaps.find((gap) => gap.id === practice.id);
      return {
        label: practice.label,
        covered: Boolean(hit?.detected),
        severity: practice.severity,
      };
    });
  }, [result]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_60%)] pb-24 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-12 sm:px-6 lg:px-8">
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-teal-200/70">
            <span>TreeHacks · Response Intelligence</span>
            <span className="h-px w-8 bg-teal-200/50" />
            <span>ReliefCanvas</span>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Turn messy field notes into launch-ready response playbooks.
              </h1>
              <p className="text-base text-slate-300 sm:text-lg">
                Mission designers co-create with an AI ops chief who sequences
                phases, stress-tests best practices, and highlights overlooked
                corridors in seconds.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center text-xs uppercase tracking-[0.25em] text-slate-400 sm:text-sm">
              <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
                <div className="text-3xl font-semibold text-emerald-300">
                  {result?.plan.signalStrength ?? 64}%
                </div>
                Signal Confidence
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4">
                <div className="text-3xl font-semibold text-sky-300">
                  {result?.plan.resilienceScore ?? 58}%
                </div>
                Resilience
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card className="border-white/10 bg-white/5 backdrop-blur">
            <CardHeader>
              <CardTitle>Mission Intake</CardTitle>
              <CardDescription>
                Describe the population, context, and what is already on the
                ground. ReliefCanvas will compose the rest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                  <label htmlFor="codename" className="text-sm font-medium">
                    Mission codename
                  </label>
                  <Input
                    id="codename"
                    value={formState.codename}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        codename: e.target.value,
                      }))
                    }
                    placeholder="e.g. Aurora Coast"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">
                      Operating region
                    </label>
                    <Input
                      id="location"
                      value={formState.location}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      placeholder="Province, country"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="window"
                      className="text-sm font-medium text-white"
                    >
                      Deployment window
                    </label>
                    <Input
                      id="window"
                      value={formState.deploymentWindow}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          deploymentWindow: e.target.value,
                        }))
                      }
                      placeholder="Feb 23-26"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="hazard" className="text-sm font-medium">
                    Hazard profile
                  </label>
                  <select
                    id="hazard"
                    value={formState.hazardProfile}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        hazardProfile: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none"
                  >
                    {hazardProfiles.map((hazard) => (
                      <option className="bg-slate-900" key={hazard}>
                        {hazard}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="population"
                    className="text-sm font-medium"
                  >
                    Population focus
                  </label>
                  <Textarea
                    id="population"
                    value={formState.populationFocus}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        populationFocus: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="assets" className="text-sm font-medium">
                    Assets already on the ground
                  </label>
                  <Textarea
                    id="assets"
                    value={formState.availableAssets}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        availableAssets: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="constraints"
                    className="text-sm font-medium"
                  >
                    Constraints + pain points
                  </label>
                  <Textarea
                    id="constraints"
                    value={formState.constraints}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        constraints: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="intel" className="text-sm font-medium">
                    Live intel feed
                  </label>
                  <Textarea
                    id="intel"
                    value={formState.intelFeed}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        intelFeed: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="partners" className="text-sm font-medium">
                    Partners + civic channels
                  </label>
                  <Textarea
                    id="partners"
                    value={formState.partners}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        partners: e.target.value,
                      }))
                    }
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Priority pillars
                    </span>
                    <span className="text-xs text-slate-400">
                      Toggle 2-4 focus areas
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map((option) => (
                      <Toggle
                        key={option.value}
                        pressed={formState.focus.includes(option.value)}
                        onPressedChange={() => handleToggle(option.value)}
                        className="border border-white/10 bg-white/5 text-xs uppercase tracking-wide text-slate-200 data-[state=on]:bg-emerald-400/20 data-[state=on]:text-emerald-200"
                      >
                        {option.label}
                      </Toggle>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Urgency (0-10)</span>
                    <span className="text-slate-400">{formState.urgency}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={formState.urgency}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        urgency: Number(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-300"
                  />
                </div>

                {error && (
                  <p className="text-sm text-rose-300">
                    {error} · Check your API keys and try again.
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-emerald-400/90 text-slate-950 hover:bg-emerald-300"
                  disabled={isPending}
                >
                  {isPending ? "Synthesizing..." : "Generate mission stack"}
                </Button>

                {history.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Recent synths
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {history.map((entry) => (
                        <li
                          key={`${entry.codename}-${entry.timestamp}`}
                          className="flex items-center justify-between text-slate-200"
                        >
                          <span>
                            {entry.codename}
                            <span className="text-slate-400">
                              {" "}
                              · {entry.location}
                            </span>
                          </span>
                          <span className="text-xs text-emerald-300">
                            {entry.coverage}% audit
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent">
              <CardHeader className="gap-4">
                <div>
                  <CardTitle>Ops Overview</CardTitle>
                  <CardDescription>
                    Scenario summary, thesis, and live mission vitals.
                  </CardDescription>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <MetricBlock
                    label="Signal Confidence"
                    value={`${result?.plan.signalStrength ?? 64}%`}
                    subtitle="LLM consensus + intel grading"
                  />
                  <MetricBlock
                    label="Risk Posture"
                    value={`${result?.plan.riskScore ?? 72}%`}
                    subtitle="Infrastructure + health threats"
                  />
                  <MetricBlock
                    label="Resilience"
                    value={`${result?.plan.resilienceScore ?? 58}%`}
                    subtitle="Redundancy &amp; safeguards"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList variant="line">
                    <TabsTrigger value="overview">Plan</TabsTrigger>
                    <TabsTrigger value="opportunity">Opportunity</TabsTrigger>
                    <TabsTrigger value="intel">Intel threads</TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value="overview"
                    className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-sm leading-relaxed text-slate-200">
                      {result?.plan.missionSummary ??
                        "Describe a mission to receive a synthesized summary, phased timeline, and best-practice audit."}
                    </p>
                    <div className="space-y-3">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        Phase sequencing
                      </span>
                      <div className="flex flex-col gap-3">
                        {(result?.plan.phases ?? []).map((phase) => (
                          <div
                            key={phase.phase}
                            className="rounded-lg border border-white/10 bg-black/20 p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-white">
                                {phase.phase}
                              </p>
                              <Badge className="bg-white/10 text-xs uppercase tracking-wide text-slate-100">
                                {phase.window}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">
                              {phase.outcome}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent
                    value="opportunity"
                    className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 p-4 text-slate-900"
                  >
                    <p className="text-sm font-medium leading-relaxed">
                      {result?.plan.opportunity ??
                        "ReliefCanvas spots leverage points—like latent local supply chains or community radios—and distills them into an actionable thesis."}
                    </p>
                  </TabsContent>
                  <TabsContent
                    value="intel"
                    className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4"
                  >
                    {(result?.plan.intel ?? []).map((thread) => (
                      <div
                        key={thread.title}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                      >
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <p className="font-medium">{thread.title}</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {thread.signal}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {thread.detail}
                        </p>
                        <Progress value={thread.confidence} className="mt-2" />
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle>Supply Threads</CardTitle>
                  <CardDescription>
                    Auto-sized payload bundles tied to real corridors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(result?.plan.supplyThreads ?? []).map((thread) => (
                    <div
                      key={thread.title}
                      className="rounded-xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{thread.title}</p>
                        <Badge variant="outline" className="border-white/20">
                          Stack
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300">{thread.summary}</p>
                      <ul className="mt-3 space-y-2 text-xs text-slate-400">
                        {thread.items.map((item) => (
                          <li
                            key={item.name}
                            className="flex items-start gap-2 rounded-md border border-white/10 bg-white/5 p-2"
                          >
                            <span className="font-medium text-slate-100">
                              {item.name}
                            </span>
                            <span className="text-slate-300">
                              {item.quantity}
                            </span>
                            <span className="text-slate-400">{item.reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5">
                <CardHeader>
                  <CardTitle>Audit Radar</CardTitle>
                  <CardDescription>
                    ReliefCanvas crosswalks Sphere + WHO practices against your
                    brief.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          Coverage
                        </p>
                        <p className="text-3xl font-semibold text-emerald-300">
                          {result?.audit.coverage ?? 0}%
                        </p>
                      </div>
                      <Badge className="bg-emerald-400/20 text-emerald-200">
                        {result ? "Live audit" : "Awaiting input"}
                      </Badge>
                    </div>
                    <Progress
                      value={result?.audit.coverage ?? 0}
                      className="mt-3"
                    />
                  </div>

                  <div className="space-y-3">
                    {(result?.audit.gaps ?? []).map((gap) => (
                      <div
                        key={gap.id}
                        className="rounded-lg border border-white/10 bg-black/20 p-3"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <p className="font-medium">{gap.label}</p>
                          <span className="text-xs uppercase tracking-[0.2em] text-slate-400">
                            {gap.detected ? "Covered" : "Gap"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {gap.guidance}
                        </p>
                      </div>
                    ))}
                  </div>

                  {coverageByCategory.length > 0 && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {coverageByCategory.map((practice) => (
                        <div
                          key={practice.label}
                          className="rounded-lg border border-white/5 bg-black/10 p-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-100">
                              {practice.label}
                            </span>
                            <span
                              className={
                                practice.covered
                                  ? "text-emerald-300"
                                  : practice.severity === "high"
                                    ? "text-rose-300"
                                    : "text-amber-200"
                              }
                            >
                              {practice.covered ? "Covered" : "Gap"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!result && (
                    <p className="text-xs text-slate-400">
                      Guidance database includes {bestPractices.length} critical
                      practices spanning water, shelter, health, logistics, and
                      communications.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {sharedHistory.length > 0 && (
              <Card className="border-white/10 bg-black/30">
                <CardHeader>
                  <CardTitle>Mission Feed</CardTitle>
                  <CardDescription>
                    Snapshot of the last missions synced through the shared API
                    endpoint.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {sharedHistory.map((entry) => (
                    <div
                      key={`${entry.codename}-${entry.timestamp}`}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {entry.codename}
                        </p>
                        <p className="text-xs text-slate-400">
                          {entry.location}
                        </p>
                      </div>
                      <div className="text-right text-xs text-emerald-200">
                        {entry.coverage}% audit
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function postSharedHistory(entry: MissionHistoryItem) {
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

async function getSharedHistory(): Promise<MissionHistoryItem[]> {
  try {
    const response = await fetch("/api/history", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: MissionHistoryItem[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}
function MetricBlock({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-left">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

async function postSharedHistory(entry: MissionHistoryItem) {
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
}

async function getSharedHistory(): Promise<MissionHistoryItem[]> {
  try {
    const response = await fetch("/api/history", { cache: "no-store" });
    if (!response.ok) return [];
    const payload = (await response.json()) as { data?: MissionHistoryItem[] };
    return payload.data ?? [];
  } catch {
    return [];
  }
}
