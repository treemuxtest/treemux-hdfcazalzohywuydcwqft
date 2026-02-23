"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Strategy,
  StrategyRequest,
  strategyRequestSchema,
  strategySchema,
} from "@/lib/strategy";

type StrategyMeta = {
  source?: string;
  notes?: string;
  reason?: string;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
};

const defaultValues: StrategyRequest = {
  organization: "TreeHacks Relief Lab",
  mission:
    "Move emergency cash, connectivity, and health kits to climate-stressed neighborhoods in under 72 hours.",
  audience: "high-trust angel donors and civic funds",
  region: "Pacific coastal tribal lands",
  budget: "$450k bridge (mix of grants + product credits)",
  urgency: "now",
  fieldNotes:
    "Local rangers have audio, sat, and text snippets proving river overruns within 3 days, yet donors see the impact 6 weeks later. Volunteers burn out syncing photos, spreadsheets, and Slack threads. People are not getting antennas in time.",
  successSignal: "donors see an actionable proof-of-impact tile within 6 hours",
  constraints: "tiny ops team, need async story capture",
};

export default function Home() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [meta, setMeta] = useState<StrategyMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StrategyRequest>({
    resolver: zodResolver(strategyRequestSchema),
    defaultValues,
  });
  const {
    formState: { errors },
  } = form;

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Strategy engine is unavailable");
      }
      const json = await res.json();
      const parsedStrategy = strategySchema.safeParse(json.data);
      if (!parsedStrategy.success) {
        throw new Error("Strategy format invalid");
      }
      setStrategy(parsedStrategy.data);
      setMeta(json.meta);
      toast.success("New runway orchestrated", {
        description:
          json.meta?.source === "openai"
            ? "Live from the operator-grade AI pipeline."
            : "Fallback playbook synthesized locally.",
      });
    } catch (error) {
      console.error(error);
      toast.error("We could not draft a plan", {
        description:
          error instanceof Error ? error.message : "Unknown strategist error",
      });
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 lg:px-0">
        <section className="space-y-6">
          <Badge variant="outline" className="border-violet-400 text-violet-200">
            TreeHacks 2026 · Adaptive fundraising ops
          </Badge>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              CausePilot turns raw field notes into donor-ready action plans in
              90 seconds.
            </h1>
            <p className="text-lg text-slate-300 sm:text-xl">
              Blend ground-truth evidence, urgency, and constraints into a
              sequenced playbook the fundraising team can actually ship.
              Operator-grade insights, zero slide decks.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1">
              <Sparkles className="size-4 text-emerald-300" />
              Narrative intelligence
            </span>
            <span className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1">
              <Wand2 className="size-4 text-sky-300" />
              Donor-ready telemetry
            </span>
            <span className="rounded-full border border-slate-800 px-3 py-1">
              Coalition plays & experiment backlog
            </span>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)]">
          <Card className="border-slate-800 bg-slate-900/60 text-slate-50">
            <CardHeader>
              <CardTitle className="text-2xl">Mission Intake</CardTitle>
              <p className="text-sm text-slate-400">
                Describe the frontline context. CausePilot distills it into
                shareable strategy, complete with telemetry donors can trust.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <Field
                    label="Organization / team"
                    field="organization"
                    error={errors.organization?.message}
                  >
                    <Input
                      id="organization"
                      placeholder="E.g. Redwood Firebridge"
                      {...form.register("organization")}
                    />
                  </Field>
                  <Field
                    label="Mission headline"
                    field="mission"
                    error={errors.mission?.message}
                  >
                    <Textarea
                      id="mission"
                      rows={2}
                      placeholder="What are you trying to unlock over the next 90 days?"
                      {...form.register("mission")}
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Primary audience"
                      field="audience"
                      error={errors.audience?.message}
                    >
                      <Input
                        id="audience"
                        placeholder="Angel donors, CSR leads, gov labs..."
                        {...form.register("audience")}
                      />
                    </Field>
                    <Field
                      label="Region / theater"
                      field="region"
                      error={errors.region?.message}
                    >
                      <Input
                        id="region"
                        placeholder="Northern Coast, Tribal Nations..."
                        {...form.register("region")}
                      />
                    </Field>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Budget window"
                      field="budget"
                      error={errors.budget?.message}
                    >
                      <Input
                        id="budget"
                        placeholder="$500k bridge, $2M rollout..."
                        {...form.register("budget")}
                      />
                    </Field>
                    <Field
                      label="Urgency"
                      field="urgency"
                      error={errors.urgency?.message}
                    >
                      <select
                        id="urgency"
                        className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50"
                        {...form.register("urgency")}
                      >
                        <option value="now">Need action this month</option>
                        <option value="quarter">Need action this quarter</option>
                        <option value="later">Need action this year</option>
                      </select>
                    </Field>
                  </div>
                  <Field
                    label="Success signal"
                    field="successSignal"
                    error={errors.successSignal?.message}
                  >
                    <Input
                      id="successSignal"
                      placeholder="E.g. donors see telemetry in 6 hours"
                      {...form.register("successSignal")}
                    />
                  </Field>
                  <Field
                    label="Constraints"
                    field="constraints"
                    error={errors.constraints?.message}
                  >
                    <Input
                      id="constraints"
                      placeholder="Bandwidth, security, compliance, etc."
                      {...form.register("constraints")}
                    />
                  </Field>
                  <Field
                    label="Field intel"
                    field="fieldNotes"
                    error={errors.fieldNotes?.message}
                  >
                    <Textarea
                      id="fieldNotes"
                      rows={5}
                      placeholder="Drop raw snippets, numbers, quotes..."
                      {...form.register("fieldNotes")}
                    />
                  </Field>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-400 text-slate-900 hover:bg-emerald-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Synthesizing
                    </span>
                  ) : (
                    "Generate runway"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {strategy ? (
              <>
                <MomentumCard strategy={strategy} meta={meta} />
                <Playbook strategy={strategy} />
                <Timeline strategy={strategy} />
                <Experiments strategy={strategy} />
              </>
            ) : (
              <Card className="border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
                <CardContent className="space-y-4 px-6 py-10">
                  <p className="text-xl text-slate-200">
                    Drop your mission intel to see:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li>• A narrative hook donors remember</li>
                    <li>• Three decisive plays and their KPIs</li>
                    <li>• Runway phases with owners + confidence</li>
                    <li>• Experiments + telemetry to prove the lift</li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  field,
  children,
  error,
}: {
  label: string;
  field: keyof StrategyRequest;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={field} className="text-slate-300">
          {label}
        </Label>
        {error && <span className="text-xs text-rose-300">{error}</span>}
      </div>
      {children}
    </div>
  );
}

function MomentumCard({
  strategy,
  meta,
}: {
  strategy: Strategy;
  meta: StrategyMeta | null;
}) {
  return (
    <Card className="border-slate-800 bg-slate-900/70 text-slate-50">
      <CardHeader>
        <CardTitle className="text-2xl">Momentum Ready</CardTitle>
        <p className="text-sm text-slate-400">{strategy.missionSummary}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">Momentum score</span>
            <span className="font-semibold text-emerald-300">
              {strategy.momentumScore}%
            </span>
          </div>
          <Progress value={strategy.momentumScore} className="mt-2 h-2" />
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
          <p className="text-base font-medium text-white">
            {strategy.narrativeHook}
          </p>
          <Separator className="my-3 bg-slate-800" />
          <div className="space-y-2 text-sm text-slate-300">
            {strategy.donorNarrative.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-400">
          {strategy.fastFacts.map((fact) => (
            <Badge
              key={fact}
              variant="outline"
              className="border-slate-700 text-slate-200"
            >
              {fact}
            </Badge>
          ))}
        </div>
        {meta && (
          <p className="text-xs text-slate-500">
            Generated via {meta.source ?? "local engine"}
            {meta.usage?.total_tokens
              ? ` · ${meta.usage.total_tokens} tokens`
              : ""}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Playbook({ strategy }: { strategy: Strategy }) {
  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Plays to launch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {strategy.plays.map((play) => (
          <div
            key={play.name}
            className="rounded-xl border border-slate-800/80 bg-slate-950/30 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-white">
                {play.name}
              </h3>
              <Badge className="bg-emerald-400/20 text-emerald-200">
                KPI: {play.kpi}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-300">{play.insight}</p>
            <Separator className="my-3 bg-slate-800/60" />
            <div className="space-y-3">
              {play.actions.map((action) => (
                <div
                  key={action.label}
                  className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-3"
                >
                  <p className="text-sm font-medium text-white">
                    {action.label}
                  </p>
                  <p className="text-sm text-slate-300">{action.detail}</p>
                  <p className="text-xs text-slate-500">
                    Metric: {action.metric}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Timeline({ strategy }: { strategy: Strategy }) {
  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Runway orchestration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {strategy.runway.map((phase) => (
          <div
            key={phase.phase}
            className="flex flex-col gap-3 rounded-xl border border-slate-800/70 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">
                {phase.duration}
              </p>
              <h4 className="text-lg font-semibold text-white">
                {phase.phase}
              </h4>
              <p className="text-sm text-slate-300">{phase.focus}</p>
            </div>
            <div className="space-y-1 text-sm text-slate-400">
              <p>Owner: {phase.owner}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs">Confidence</span>
                <div className="h-2 w-32 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${Math.round(phase.confidence * 100)}%` }}
                  />
                </div>
                <span className="text-xs">
                  {Math.round(phase.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        ))}
        <div className="space-y-2 rounded-xl border border-slate-800/70 bg-slate-950/30 p-4 text-sm text-slate-300">
          <p className="text-white">Risk watchouts</p>
          <ul className="space-y-1">
            {strategy.riskWatchouts.map((risk) => (
              <li key={risk} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-rose-400" />
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function Experiments({ strategy }: { strategy: Strategy }) {
  return (
    <Card className="border-slate-800 bg-slate-900/70">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          Experiments & telemetry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-slate-800/60">
          <table className="w-full text-sm">
            <thead className="bg-slate-950/60 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Experiment</th>
                <th className="px-4 py-3">Lift</th>
                <th className="px-4 py-3">Effort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {strategy.experiments.map((exp) => (
                <tr key={exp.name}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{exp.name}</p>
                    <p className="text-xs text-slate-400">{exp.hypothesis}</p>
                  </td>
                  <td className="px-4 py-3">{exp.lift}</td>
                  <td className="px-4 py-3">{exp.effort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {strategy.signals.map((signal) => (
            <div
              key={signal.metric}
              className="rounded-xl border border-slate-800 bg-slate-950/40 p-4"
            >
              <p className="text-sm uppercase tracking-wide text-slate-500">
                {signal.metric}
              </p>
              <p className="text-lg font-semibold text-white">
                {signal.target}
              </p>
              <p className="text-xs text-slate-400">
                Baseline {signal.baseline}
              </p>
              <p className="text-xs text-slate-500">
                Instrumentation: {signal.instrumentation}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
