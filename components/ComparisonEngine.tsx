"use client";

import {
  BadgePercent,
  BarChart3,
  Check,
  Cpu,
  Download,
  GraduationCap,
  Laptop,
  Loader2,
  Monitor,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  Trophy,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  type ComparisonCategoryFilter,
  type DecisionPriority,
  type DecisionWeights,
  comparisonCategories,
  comparisonDimensionCount,
  filterComparisonFeatures,
  getFeatureVerdict,
  getMachineAtlasScore,
  getMachineDecisionBreakdown,
} from "@/data/comparisonAtlas";
import { seedMachines } from "@/data/machines";
import { runMlRecommendation } from "@/lib/ml/recommendationEngine";
import { cn } from "@/lib/utils";
import type { MachineProfile } from "@/types/pc";

import { MachineLearningLab } from "./MachineLearningLab";

type AiComparison = {
  verdict: string;
  winnerByWorkload?: string;
  matrix: Array<{
    machine: string;
    display: string;
    osFlexibility: string;
    upgradeability: string;
    performance: string;
    discountPosition?: string;
    risks: string[];
  }>;
  dimensionFindings?: Array<{
    dimension: string;
    winner: string;
    reason: string;
  }>;
  discountOpportunities?: Array<{
    machine: string;
    retailer: string;
    opportunity: string;
    confidence: number;
    sourceUrl?: string;
  }>;
  sourcesChecked: string[];
  groundingSources?: { uri?: string; title?: string }[];
  webSearchQueries?: string[];
};

const rows = [
  { key: "display", label: "External Displays", icon: Monitor },
  { key: "os", label: "OS Flexibility", icon: Check },
  { key: "upgrade", label: "Upgradeability", icon: Wrench },
  { key: "performance", label: "Performance", icon: BarChart3 },
] as const;

const priorityLabels: Record<DecisionPriority, string> = {
  performance: "Performance",
  upgradeability: "Upgradeability",
  compatibility: "OS compatibility",
  display: "External displays",
  value: "Value & discounts",
  portability: "Portability",
};

const defaultWeights: DecisionWeights = {
  performance: 85,
  upgradeability: 70,
  compatibility: 80,
  display: 65,
  value: 90,
  portability: 60,
};

const savingsOptions = [
  ["student", "Student", GraduationCap],
  ["military", "Military / veteran", ShieldCheck],
  ["educator", "Educator", GraduationCap],
  ["healthcare", "Healthcare worker", ShieldCheck],
  ["openBox", "Open-box offers", BadgePercent],
  ["refurbished", "Refurbished offers", Wrench],
] as const;

export function ComparisonEngine() {
  const [selected, setSelected] = useState(seedMachines.map((machine) => machine.id));
  const [workload, setWorkload] = useState("React development, Docker, 45-inch ultrawide");
  const [machineView, setMachineView] = useState<"All" | "Laptops" | "Desktop">("All");
  const [weights, setWeights] = useState<DecisionWeights>(defaultWeights);
  const [discountProfile, setDiscountProfile] = useState({
    student: false,
    military: false,
    educator: false,
    healthcare: false,
    openBox: true,
    refurbished: true,
    preferredRetailers: "Best Buy, Lenovo, Dell, HP, Framework, Newegg, Amazon",
  });
  const [atlasCategory, setAtlasCategory] =
    useState<ComparisonCategoryFilter>("All");
  const [atlasQuery, setAtlasQuery] = useState("");
  const [atlasLimit, setAtlasLimit] = useState(30);
  const [aiState, setAiState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; data: AiComparison }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const machines = useMemo(
    () => seedMachines.filter((machine) => selected.includes(machine.id)),
    [selected],
  );

  const visibleMachineChoices = useMemo(
    () =>
      seedMachines.filter((machine) => {
        if (machineView === "Laptops") return machine.class === "Laptop";
        if (machineView === "Desktop") return machine.class !== "Laptop";
        return true;
      }),
    [machineView],
  );

  const rankedMachines = useMemo(
    () =>
      machines
        .map((machine) => ({
          machine,
          breakdown: getMachineDecisionBreakdown(machine, weights),
        }))
        .sort((a, b) => b.breakdown.total - a.breakdown.total),
    [machines, weights],
  );

  const autoMlRecommendation = useMemo(
    () =>
      runMlRecommendation({
        machines,
        workload,
        decisionWeights: weights,
      }),
    [machines, weights, workload],
  );

  const visibleFeatures = useMemo(
    () => filterComparisonFeatures(atlasCategory, atlasQuery),
    [atlasCategory, atlasQuery],
  );

  const displayedFeatures = useMemo(
    () => visibleFeatures.slice(0, atlasLimit),
    [atlasLimit, visibleFeatures],
  );

  const atlasCsv = useMemo(
    () =>
      [
        [
          "dimension",
          "category",
          ...machines.flatMap((machine) => [
            `${machine.name} value`,
            `${machine.name} score`,
            `${machine.name} note`,
          ]),
        ].join(","),
        ...visibleFeatures.map((feature) =>
          [
            feature.title,
            feature.category,
            ...machines.flatMap((machine) => {
              const verdict = getFeatureVerdict(machine, feature);
              return [verdict.value, String(verdict.score), verdict.note];
            }),
          ]
            .map((value) => `"${value.replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n"),
    [machines, visibleFeatures],
  );

  async function runDeepDive() {
    setAiState({ status: "loading" });
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machines: machines.map((machine) => machine.name),
          workload,
          discountProfile,
          mlContext: {
            winner: autoMlRecommendation.winner.machine.name,
            winnerScore: autoMlRecommendation.winner.ensembleScore,
            confidence: autoMlRecommendation.winner.confidence,
            consensus: autoMlRecommendation.consensus,
            archetype: autoMlRecommendation.archetype,
            ranking: autoMlRecommendation.predictions.map((prediction) => ({
              machine: prediction.machine.name,
              score: prediction.ensembleScore,
              confidence: prediction.confidence,
            })),
            strongestSignals: autoMlRecommendation.winner.strongestSignals.map(
              (signal) => signal.label,
            ),
          },
        }),
      });
      const payload = (await response.json()) as AiComparison & { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Comparison request failed.");
      }

      setAiState({ status: "done", data: payload });
    } catch (error) {
      setAiState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-ember">
            Versus Matrix
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
            Laptop vs desktop capability matrix
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Compare display ceilings, OS flexibility, upgrade paths, and
            sustained performance beyond headline RAM and CPU specs.
          </p>
        </div>
        <Cpu className="h-8 w-8 text-sage" aria-hidden="true" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit rounded-md border border-slate-200 bg-slate-100 p-1">
          {(["All", "Laptops", "Desktop"] as const).map((view) => (
            <button
              className={cn(
                "min-h-9 rounded px-3 text-sm font-black transition",
                machineView === view
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500 hover:text-slate-950",
              )}
              key={view}
              onClick={() => setMachineView(view)}
              type="button"
            >
              {view}
            </button>
          ))}
        </div>
        <button
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-sage bg-teal-50 px-3 text-sm font-black text-sage transition hover:bg-teal-100"
          onClick={() => {
            setMachineView("Laptops");
            setSelected(
              seedMachines
                .filter((machine) => machine.class === "Laptop")
                .map((machine) => machine.id),
            );
          }}
          type="button"
        >
          <Laptop className="h-4 w-4" aria-hidden="true" />
          Laptop showdown
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {visibleMachineChoices.map((machine) => (
          <button
            className={cn(
              "grid min-h-16 gap-1 rounded-lg border px-3 py-2 text-left transition",
              selected.includes(machine.id)
                ? "border-sage bg-teal-50"
                : "border-slate-200 bg-white hover:bg-slate-50",
            )}
            key={machine.id}
            onClick={() =>
              setSelected((current) =>
                current.includes(machine.id)
                  ? current.length === 1
                    ? current
                    : current.filter((id) => id !== machine.id)
                  : [...current, machine.id],
              )
            }
            type="button"
          >
            <span className="text-xs font-bold text-slate-500">{machine.class}</span>
            <strong className="text-sm text-slate-950">{machine.name}</strong>
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-ember">
                Decision Weights
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Make the winner match your priorities
              </h3>
            </div>
            <button
              className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:text-slate-950"
              onClick={() => setWeights(defaultWeights)}
              title="Reset decision weights"
              type="button"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {(Object.keys(priorityLabels) as DecisionPriority[]).map((priority) => (
              <label
                className="grid grid-cols-[132px_minmax(80px,1fr)_34px] items-center gap-3 text-sm"
                key={priority}
              >
                <span className="font-bold text-slate-600">
                  {priorityLabels[priority]}
                </span>
                <input
                  className="accent-teal-700"
                  max="100"
                  min="0"
                  onChange={(event) =>
                    setWeights((current) => ({
                      ...current,
                      [priority]: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={weights[priority]}
                />
                <strong className="text-right text-slate-950">
                  {weights[priority]}
                </strong>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-ember">
                Ranked Decision
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Live weighted winner
              </h3>
            </div>
            <Sparkles className="h-5 w-5 text-sage" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-2">
            {rankedMachines.map(({ machine, breakdown }, index) => (
              <article
                className={cn(
                  "grid gap-3 rounded-md border p-3 sm:grid-cols-[36px_minmax(180px,1fr)_minmax(180px,1fr)_48px] sm:items-center",
                  index === 0
                    ? "border-sage bg-teal-50"
                    : "border-slate-200 bg-slate-50",
                )}
                key={`ranked-${machine.id}`}
              >
                <span className="grid h-8 w-8 place-items-center rounded-md bg-white text-sm font-black text-sage">
                  #{index + 1}
                </span>
                <div>
                  <strong className="text-sm text-slate-950">{machine.name}</strong>
                  <span className="mt-1 block text-xs font-bold text-slate-500">
                    {machine.class} | ${machine.price.toLocaleString()} baseline
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center text-xs">
                  {(["performance", "value", "upgradeability"] as DecisionPriority[]).map(
                    (priority) => (
                      <span
                        className="rounded bg-white px-1 py-1 font-bold text-slate-600"
                        key={`${machine.id}-${priority}`}
                      >
                        {priority.slice(0, 4)} {breakdown[priority]}
                      </span>
                    ),
                  )}
                </div>
                <strong className="text-right text-2xl text-sage">
                  {breakdown.total}
                </strong>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {machines.map((machine) => (
          <article
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            key={`atlas-score-${machine.id}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-ember">
                Atlas Score
              </span>
              <Trophy className="h-5 w-5 text-sage" aria-hidden="true" />
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <strong className="text-3xl font-black text-slate-950">
                {getMachineAtlasScore(machine)}
              </strong>
              <span className="text-right text-sm font-bold text-slate-600">
                {machine.name}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
              <span
                className="block h-full rounded-full bg-sage"
                style={{ width: `${getMachineAtlasScore(machine)}%` }}
              />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-5">
        <MachineLearningLab machines={machines} workload={workload} weights={weights} />
      </div>

      <section className="mt-5 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BadgePercent className="h-5 w-5 text-cobalt" aria-hidden="true" />
              <p className="text-xs font-black uppercase tracking-wide text-cobalt">
                Laptop Coupon & Discount Hunter
              </p>
            </div>
            <h3 className="mt-2 text-lg font-black text-slate-950">
              Search only for savings you can actually use
            </h3>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
              Gemini checks official programs, retailer coupons, open-box and
              refurbished inventory, bundles, and price-match opportunities for
              the selected laptops.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-black text-slate-600">
            <ShieldCheck className="h-4 w-4 text-sage" aria-hidden="true" />
            Eligibility is used only in this request
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {savingsOptions.map(([key, label, Icon]) => (
            <label
              className="flex min-h-11 items-center gap-3 rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-slate-700"
              key={key}
            >
              <input
                checked={discountProfile[key]}
                className="h-4 w-4 accent-teal-700"
                onChange={(event) =>
                  setDiscountProfile((current) => ({
                    ...current,
                    [key]: event.target.checked,
                  }))
                }
                type="checkbox"
              />
              <Icon className="h-4 w-4 text-cobalt" aria-hidden="true" />
              {label}
            </label>
          ))}
        </div>

        <label className="mt-3 grid gap-2 text-sm font-bold text-slate-600">
          Preferred retailers
          <input
            className="min-h-11 rounded-md border border-blue-200 bg-white px-3 text-slate-950 focus:border-cobalt focus:ring-4 focus:ring-blue-100"
            onChange={(event) =>
              setDiscountProfile((current) => ({
                ...current,
                preferredRetailers: event.target.value,
              }))
            }
            value={discountProfile.preferredRetailers}
          />
        </label>
      </section>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-end">
        <label className="grid gap-2 text-sm font-bold text-slate-600">
          Deep-dive workload
          <input
            className="min-h-12 rounded-md border border-slate-300 px-3 text-slate-950 focus:border-sage focus:ring-4 focus:ring-teal-100"
            value={workload}
            onChange={(event) => setWorkload(event.target.value)}
          />
        </label>
        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={runDeepDive}
          disabled={!machines.length || aiState.status === "loading"}
        >
          {aiState.status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <BadgePercent className="h-5 w-5" />
          )}
          Find coupons + compare
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
        <div
          className="min-w-[920px]"
          role="table"
          aria-label="Computer comparison matrix"
        >
          <div
            className="grid border-b border-slate-200 bg-slate-100 text-sm text-slate-600"
            style={{ gridTemplateColumns: `190px repeat(${machines.length}, minmax(250px, 1fr))` }}
            role="row"
          >
            <div className="p-4 font-black" role="columnheader">
              Capability
            </div>
            {machines.map((machine) => (
              <div className="border-l border-slate-200 p-4" role="columnheader" key={machine.id}>
                <span>{machine.class}</span>
                <strong className="mt-1 block text-base text-slate-950">{machine.name}</strong>
              </div>
            ))}
          </div>

          {rows.map((row) => (
            <div
              className="grid border-b border-slate-200 last:border-b-0"
              style={{ gridTemplateColumns: `190px repeat(${machines.length}, minmax(250px, 1fr))` }}
              role="row"
              key={row.key}
            >
              <div className="flex items-center gap-2 p-4 font-black text-slate-950" role="rowheader">
                <row.icon className="h-5 w-5 text-sage" aria-hidden="true" />
                {row.label}
              </div>
              {machines.map((machine) => (
                <div className="border-l border-slate-200 p-4" role="cell" key={`${row.key}-${machine.id}`}>
                  <MatrixCell row={row.key} machine={machine} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-ember">
              {comparisonDimensionCount}+ Compare Atlas
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-normal text-slate-950">
              Every meaningful PC and laptop buying dimension
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Search hardware filters, benchmarks, OS support, discounts,
              education, account workflows, pricing analytics, and power-user
              exports in one side-by-side grid.
            </p>
          </div>
          <a
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-black text-white transition hover:bg-slate-800"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(atlasCsv)}`}
            download="pc-comparer-atlas.csv"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export atlas
          </a>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,360px)]">
          <div className="flex flex-wrap gap-2">
            {comparisonCategories.map((category) => (
              <button
                className={cn(
                  "min-h-10 rounded-md border px-3 text-sm font-black transition",
                  atlasCategory === category
                    ? "border-sage bg-white text-sage"
                    : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-white",
                )}
                key={category}
                onClick={() => {
                  setAtlasCategory(category);
                  setAtlasLimit(30);
                }}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          <label className="relative">
            <span className="sr-only">Search comparison dimensions</span>
            <Search
              className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500"
              aria-hidden="true"
            />
            <input
              className="min-h-11 w-full rounded-md border border-slate-300 bg-white px-10 text-sm text-slate-950 focus:border-sage focus:ring-4 focus:ring-teal-100"
              value={atlasQuery}
              onChange={(event) => {
                setAtlasQuery(event.target.value);
                setAtlasLimit(30);
              }}
              placeholder="Search 285 dimensions"
            />
          </label>
        </div>

        <p className="mt-3 text-sm font-bold text-slate-500">
          Showing {Math.min(displayedFeatures.length, visibleFeatures.length)} of{" "}
          {visibleFeatures.length} matching dimensions
        </p>

        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <div
            className="min-w-[1040px]"
            role="table"
            aria-label="285-dimension comparison atlas"
          >
            <div
              className="grid border-b border-slate-200 bg-slate-100 text-sm text-slate-600"
              style={{
                gridTemplateColumns: `260px repeat(${machines.length}, minmax(260px, 1fr))`,
              }}
              role="row"
            >
              <div className="p-4 font-black" role="columnheader">
                Dimension
              </div>
              {machines.map((machine) => (
                <div
                  className="border-l border-slate-200 p-4"
                  role="columnheader"
                  key={`atlas-head-${machine.id}`}
                >
                  <span>{machine.class}</span>
                  <strong className="mt-1 block text-base text-slate-950">
                    {machine.name}
                  </strong>
                </div>
              ))}
            </div>

            {displayedFeatures.map((feature) => (
              <div
                className="grid border-b border-slate-200 last:border-b-0"
                style={{
                  gridTemplateColumns: `260px repeat(${machines.length}, minmax(260px, 1fr))`,
                }}
                role="row"
                key={feature.id}
              >
                <div className="p-4" role="rowheader">
                  <div className="flex items-center gap-2">
                    <Tags className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                    <strong className="text-sm text-slate-950">{feature.title}</strong>
                  </div>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {feature.category} | {feature.layer}
                  </p>
                </div>
                {machines.map((machine) => {
                  const verdict = getFeatureVerdict(machine, feature);

                  return (
                    <div
                      className="border-l border-slate-200 p-4"
                      role="cell"
                      key={`${feature.id}-${machine.id}`}
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-3">
                        <p className="text-sm font-bold leading-5 text-slate-950">
                          {verdict.value}
                        </p>
                        <strong className="text-right text-lg text-sage">
                          {verdict.score}
                        </strong>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <span
                          className="block h-full rounded-full bg-sage"
                          style={{ width: `${verdict.score}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600">
                        {verdict.note}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        {displayedFeatures.length < visibleFeatures.length && (
          <button
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md border border-sage bg-white px-4 text-sm font-black text-sage transition hover:bg-teal-50"
            onClick={() => setAtlasLimit((current) => current + 30)}
            type="button"
          >
            Show 30 more dimensions
          </button>
        )}
      </div>

      {aiState.status === "error" && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {aiState.message} Live spec verification requires{" "}
          <code>GEMINI_API_KEY</code>.
        </div>
      )}

      {aiState.status === "done" && (
        <div className="mt-4 rounded-md border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
          <strong>{aiState.data.verdict}</strong>
          {aiState.data.winnerByWorkload && (
            <p className="mt-1">
              Workload winner:{" "}
              <span className="font-black">{aiState.data.winnerByWorkload}</span>
            </p>
          )}
          {!!aiState.data.discountOpportunities?.length && (
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {aiState.data.discountOpportunities.slice(0, 4).map((deal) => (
                <article
                  className="rounded-md border border-teal-200 bg-white p-3"
                  key={`${deal.machine}-${deal.retailer}-${deal.opportunity}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-black text-slate-950">{deal.machine}</span>
                    <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-black text-teal-800">
                      {deal.confidence}% confidence
                    </span>
                  </div>
                  <p className="mt-1 text-slate-700">
                    {deal.retailer}: {deal.opportunity}
                  </p>
                  {deal.sourceUrl && (
                    <a
                      className="mt-2 inline-flex font-black text-cobalt"
                      href={deal.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Verify deal
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
          {!!aiState.data.dimensionFindings?.length && (
            <div className="mt-4 grid gap-2">
              {aiState.data.dimensionFindings.slice(0, 5).map((finding) => (
                <div
                  className="rounded-md bg-white px-3 py-2"
                  key={`${finding.dimension}-${finding.winner}`}
                >
                  <span className="font-black text-slate-950">
                    {finding.dimension}
                  </span>
                  <span className="mx-2 text-slate-400">|</span>
                  <span>{finding.winner}: {finding.reason}</span>
                </div>
              ))}
            </div>
          )}
          {!!aiState.data.webSearchQueries?.length && (
            <div className="mt-4 flex flex-wrap gap-2">
              {aiState.data.webSearchQueries.slice(0, 6).map((query) => (
                <span
                  className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-600"
                  key={query}
                >
                  {query}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-3">
            {aiState.data.groundingSources
              ?.slice(0, 4)
              .map((source: { uri?: string; title?: string }) => (
                <a
                  className="font-black text-cobalt"
                  href={source.uri}
                  key={source.uri}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title || source.uri}
                </a>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}

function MatrixCell({
  row,
  machine,
}: {
  row: "display" | "os" | "upgrade" | "performance";
  machine: MachineProfile;
}) {
  if (row === "display") {
    return (
      <div className="space-y-2 text-sm leading-6">
        <strong className="text-slate-950">
          {machine.displaySupport.ultrawide45} for 45-inch ultrawide
        </strong>
        <p className="text-slate-600">{machine.displaySupport.hdmi}</p>
        <p className="text-slate-600">{machine.displaySupport.displayPort}</p>
      </div>
    );
  }

  if (row === "os") {
    return (
      <div>
        <Score label="Windows" value={machine.osFlexibility.windows11} />
        <Score label="Linux" value={machine.osFlexibility.linux} />
        <Score label="Arch" value={machine.osFlexibility.arch} />
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {machine.osFlexibility.notes}
        </p>
      </div>
    );
  }

  if (row === "upgrade") {
    return (
      <div className="space-y-2 text-sm leading-6 text-slate-600">
        <p>{machine.upgradeability.ram}</p>
        <p>{machine.upgradeability.storage}</p>
        <p>{machine.upgradeability.cpuSocket}</p>
      </div>
    );
  }

  return (
    <div>
      <Score label="Single" value={machine.benchmarks.singleCore} />
      <Score label="Multi" value={machine.benchmarks.multiCore} />
      <Score label="Sustained" value={machine.benchmarks.sustainedLoad} />
      <Score label="1080p FPS" value={machine.benchmarks.gaming1080p} />
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="my-2 grid grid-cols-[78px_minmax(70px,1fr)_34px] items-center gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <i className="block h-full rounded-full bg-sage" style={{ width: `${value}%` }} />
      </div>
      <b className="text-right text-slate-950">{value}</b>
    </div>
  );
}
