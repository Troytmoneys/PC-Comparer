"use client";

import {
  Activity,
  BrainCircuit,
  ChartNoAxesCombined,
  CircleGauge,
  FlaskConical,
  Lightbulb,
  Network,
  ShieldQuestion,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useMemo, useState } from "react";

import type { DecisionWeights } from "@/data/comparisonAtlas";
import { cn } from "@/lib/utils";
import {
  mlFeatureLabels,
  runMlRecommendation,
  type WorkloadArchetype,
} from "@/lib/ml/recommendationEngine";
import type { MachineProfile } from "@/types/pc";

const archetypes: WorkloadArchetype[] = [
  "Auto",
  "Developer",
  "Gaming",
  "Creator",
  "Linux power user",
  "Traveler",
  "Value hunter",
];

export function MachineLearningLab({
  machines,
  workload,
  weights,
}: {
  machines: MachineProfile[];
  workload: string;
  weights: DecisionWeights;
}) {
  const [archetype, setArchetype] = useState<WorkloadArchetype>("Auto");
  const recommendation = useMemo(
    () =>
      runMlRecommendation({
        machines,
        workload,
        decisionWeights: weights,
        archetype,
      }),
    [archetype, machines, weights, workload],
  );
  const winner = recommendation.winner;
  const challenger = recommendation.predictions[1];

  return (
    <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-sage" aria-hidden="true" />
            <p className="text-xs font-black uppercase tracking-wide text-ember">
              Explainable Machine Learning Lab
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">
            Four-model ensemble recommendation
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Utility scoring, K-nearest neighbors, a decision-stump forest, and
            Bayesian fit vote on the best machine. Monte Carlo simulations
            quantify uncertainty instead of pretending every score is exact.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric
            icon={Network}
            label="Models"
            value="4"
          />
          <Metric
            icon={FlaskConical}
            label="Simulations"
            value={String(winner.uncertainty.samples)}
          />
          <Metric
            icon={CircleGauge}
            label="Consensus"
            value={`${recommendation.consensus}%`}
          />
          <Metric
            icon={Target}
            label="Features"
            value="18"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {archetypes.map((item) => (
          <button
            className={cn(
              "min-h-10 rounded-md border px-3 text-sm font-black transition",
              item === archetype
                ? "border-sage bg-teal-50 text-sage"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
            key={item}
            onClick={() => setArchetype(item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-sage">
                <Trophy className="h-5 w-5" aria-hidden="true" />
                Ensemble winner for {recommendation.archetype}
              </div>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {winner.machine.name}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-700">
                {recommendation.summary}
              </p>
            </div>
            <div className="grid min-w-32 place-items-center rounded-lg border border-teal-200 bg-white p-4">
              <strong className="text-4xl font-black text-sage">
                {winner.ensembleScore}
              </strong>
              <span className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">
                ML score
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {winner.modelScores.map((model) => (
              <div
                className="rounded-md border border-teal-200 bg-white p-3"
                key={model.model}
              >
                <span className="text-xs font-black text-slate-500">
                  {model.model}
                </span>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <strong className="text-2xl font-black text-slate-950">
                    {model.score}
                  </strong>
                  <span className="text-xs font-bold text-slate-500">
                    {Math.round(model.weight * 100)}% vote
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <InfoMetric
              label="Prediction confidence"
              value={`${winner.confidence}%`}
              body="Agreement after model spread and uncertainty penalties."
            />
            <InfoMetric
              label="Likely score range"
              value={`${winner.uncertainty.low}-${winner.uncertainty.high}`}
              body="10th to 90th percentile across noisy simulations."
            />
            <InfoMetric
              label="Win probability"
              value={`${winner.uncertainty.winProbability}%`}
              body="Softmax probability against the selected field."
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-ember">
                Why It Won
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Highest-impact signals
              </h3>
            </div>
            <Lightbulb className="h-5 w-5 text-sage" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-3">
            {winner.strongestSignals.map((signal) => (
              <div className="grid gap-2" key={signal.feature}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-slate-700">{signal.label}</span>
                  <span className="font-black text-slate-950">
                    {signal.value} | {signal.importance}% importance
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <span
                    className="block h-full rounded-full bg-sage"
                    style={{ width: `${signal.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
        <div className="min-w-[900px]" role="table" aria-label="Machine learning rankings">
          <div
            className="grid border-b border-slate-200 bg-slate-100 p-3 text-xs font-black uppercase tracking-wide text-slate-500"
            style={{ gridTemplateColumns: "54px minmax(220px,1fr) 100px 120px 120px 150px" }}
            role="row"
          >
            <span>Rank</span>
            <span>Machine</span>
            <span>Ensemble</span>
            <span>Confidence</span>
            <span>Win chance</span>
            <span>Pareto status</span>
          </div>
          {recommendation.predictions.map((prediction) => (
            <div
              className="grid items-center border-b border-slate-200 p-3 text-sm last:border-b-0"
              style={{ gridTemplateColumns: "54px minmax(220px,1fr) 100px 120px 120px 150px" }}
              role="row"
              key={`ml-rank-${prediction.machine.id}`}
            >
              <strong className="text-sage">#{prediction.rank}</strong>
              <div>
                <strong className="text-slate-950">{prediction.machine.name}</strong>
                <span className="mt-1 block text-xs font-bold text-slate-500">
                  {prediction.machine.class} | ${prediction.machine.price.toLocaleString()}
                </span>
              </div>
              <strong className="text-lg text-slate-950">{prediction.ensembleScore}</strong>
              <span className="font-bold text-slate-600">{prediction.confidence}%</span>
              <span className="font-bold text-slate-600">
                {prediction.uncertainty.winProbability}%
              </span>
              <span
                className={cn(
                  "w-fit rounded-full px-2 py-1 text-xs font-black",
                  prediction.paretoEfficient
                    ? "bg-teal-50 text-teal-800"
                    : "bg-slate-100 text-slate-500",
                )}
              >
                {prediction.paretoEfficient ? "Efficient frontier" : "Dominated"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-ember">
                Model Sensitivity
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                Who wins when one priority dominates?
              </h3>
            </div>
            <Activity className="h-5 w-5 text-sage" aria-hidden="true" />
          </div>
          <div className="mt-4 grid gap-2">
            {recommendation.sensitivity.map((item) => (
              <div
                className="grid grid-cols-[120px_minmax(0,1fr)_38px] items-center gap-3 rounded-md bg-slate-50 px-3 py-2 text-sm"
                key={item.priority}
              >
                <span className="font-black capitalize text-slate-600">
                  {item.priority}
                </span>
                <span className="truncate font-bold text-slate-950">{item.winner}</span>
                <strong className="text-right text-sage">{item.score}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-ember">
                Counterfactuals
              </p>
              <h3 className="mt-1 text-lg font-black text-slate-950">
                What would make the challenger win?
              </h3>
            </div>
            <ShieldQuestion className="h-5 w-5 text-sage" aria-hidden="true" />
          </div>
          {challenger ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-slate-600">
                For <strong className="text-slate-950">{challenger.machine.name}</strong>{" "}
                to overtake the winner:
              </p>
              <div className="mt-3 grid gap-2">
                {challenger.counterfactuals.map((item) => (
                  <div className="rounded-md bg-slate-50 p-3" key={item.feature}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-black text-slate-950">{item.label}</span>
                      <span className="text-xs font-black text-sage">
                        +{item.scoreGain} possible
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-slate-600">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Add another machine to generate counterfactual recommendations.
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined className="h-5 w-5 text-sage" aria-hidden="true" />
          <h3 className="font-black text-slate-950">Learned feature importance</h3>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(recommendation.featureWeights)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 9)
            .map(([feature, importance]) => (
              <div
                className="grid grid-cols-[minmax(0,1fr)_44px] items-center gap-3 rounded-md bg-white px-3 py-2 text-sm"
                key={feature}
              >
                <span className="font-bold text-slate-600">
                  {mlFeatureLabels[feature as keyof typeof mlFeatureLabels]}
                </span>
                <strong className="text-right text-sage">
                  {Math.round(importance * 100)}%
                </strong>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-24 rounded-md border border-slate-200 bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-sage" aria-hidden="true" />
      <strong className="mt-2 block text-lg text-slate-950">{value}</strong>
      <span className="text-xs font-bold text-slate-500">{label}</span>
    </div>
  );
}

function InfoMetric({
  label,
  value,
  body,
}: {
  label: string;
  value: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-teal-200 bg-white p-3">
      <span className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <strong className="mt-2 block text-xl text-slate-950">{value}</strong>
      <p className="mt-1 text-xs leading-5 text-slate-600">{body}</p>
    </div>
  );
}
