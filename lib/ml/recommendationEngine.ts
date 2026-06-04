import type {
  DecisionPriority,
  DecisionWeights,
} from "@/data/comparisonAtlas";
import type { MachineProfile } from "@/types/pc";

export type MlFeatureKey =
  | "priceValue"
  | "singleCore"
  | "multiCore"
  | "sustained"
  | "quietness"
  | "gaming"
  | "windows"
  | "linux"
  | "arch"
  | "atlas"
  | "ramUpgrade"
  | "storageUpgrade"
  | "cpuUpgrade"
  | "gpuUpgrade"
  | "display"
  | "portability"
  | "repairability"
  | "efficiency";

export type FeatureVector = Record<MlFeatureKey, number>;

export type MlModelName =
  | "Utility model"
  | "K-nearest neighbors"
  | "Decision forest"
  | "Bayesian fit";

export type WorkloadArchetype =
  | "Auto"
  | "Developer"
  | "Gaming"
  | "Creator"
  | "Linux power user"
  | "Traveler"
  | "Value hunter";

export type MlModelScore = {
  model: MlModelName;
  score: number;
  weight: number;
};

export type FeatureContribution = {
  feature: MlFeatureKey;
  label: string;
  value: number;
  importance: number;
  contribution: number;
};

export type MonteCarloResult = {
  mean: number;
  low: number;
  high: number;
  samples: number;
  winProbability: number;
};

export type Counterfactual = {
  feature: MlFeatureKey;
  label: string;
  currentValue: number;
  targetValue: number;
  scoreGain: number;
  explanation: string;
};

export type MachineMlPrediction = {
  machine: MachineProfile;
  vector: FeatureVector;
  ensembleScore: number;
  confidence: number;
  rank: number;
  modelScores: MlModelScore[];
  strongestSignals: FeatureContribution[];
  weakestSignals: FeatureContribution[];
  uncertainty: MonteCarloResult;
  counterfactuals: Counterfactual[];
  paretoEfficient: boolean;
};

export type MlRecommendation = {
  archetype: WorkloadArchetype;
  winner: MachineMlPrediction;
  predictions: MachineMlPrediction[];
  featureWeights: FeatureVector;
  paretoFrontier: string[];
  consensus: number;
  summary: string;
  sensitivity: Array<{
    priority: DecisionPriority;
    winner: string;
    score: number;
  }>;
};

type TrainingSample = {
  vector: FeatureVector;
  target: number;
  archetype: Exclude<WorkloadArchetype, "Auto">;
};

type DecisionStump = {
  feature: MlFeatureKey;
  threshold: number;
  lowPrediction: number;
  highPrediction: number;
  error: number;
};

const featureKeys: MlFeatureKey[] = [
  "priceValue",
  "singleCore",
  "multiCore",
  "sustained",
  "quietness",
  "gaming",
  "windows",
  "linux",
  "arch",
  "atlas",
  "ramUpgrade",
  "storageUpgrade",
  "cpuUpgrade",
  "gpuUpgrade",
  "display",
  "portability",
  "repairability",
  "efficiency",
];

export const mlFeatureLabels: Record<MlFeatureKey, string> = {
  priceValue: "Price value",
  singleCore: "Single-core speed",
  multiCore: "Multi-core speed",
  sustained: "Sustained performance",
  quietness: "Quiet operation",
  gaming: "Gaming performance",
  windows: "Windows readiness",
  linux: "Linux readiness",
  arch: "Arch Linux readiness",
  atlas: "Debloated Windows fit",
  ramUpgrade: "RAM upgrade path",
  storageUpgrade: "Storage upgrade path",
  cpuUpgrade: "CPU upgrade path",
  gpuUpgrade: "GPU upgrade path",
  display: "External display support",
  portability: "Portability",
  repairability: "Repairability",
  efficiency: "Energy efficiency",
};

const archetypeWeights: Record<
  Exclude<WorkloadArchetype, "Auto">,
  FeatureVector
> = {
  Developer: vector({
    priceValue: 0.7,
    singleCore: 1,
    multiCore: 1,
    sustained: 0.9,
    quietness: 0.6,
    windows: 0.8,
    linux: 1,
    arch: 0.8,
    ramUpgrade: 1,
    storageUpgrade: 0.8,
    display: 0.9,
    repairability: 0.5,
    efficiency: 0.5,
  }),
  Gaming: vector({
    priceValue: 0.8,
    singleCore: 0.8,
    multiCore: 0.55,
    sustained: 1,
    quietness: 0.45,
    gaming: 1.35,
    windows: 1,
    atlas: 0.65,
    ramUpgrade: 0.55,
    storageUpgrade: 0.7,
    gpuUpgrade: 0.55,
    display: 1,
  }),
  Creator: vector({
    priceValue: 0.55,
    singleCore: 0.75,
    multiCore: 1.2,
    sustained: 1.15,
    quietness: 0.6,
    gaming: 0.8,
    windows: 0.8,
    ramUpgrade: 0.8,
    storageUpgrade: 1,
    display: 1,
    repairability: 0.5,
  }),
  "Linux power user": vector({
    priceValue: 0.65,
    singleCore: 0.7,
    multiCore: 0.8,
    sustained: 0.75,
    quietness: 0.6,
    linux: 1.35,
    arch: 1.25,
    ramUpgrade: 1,
    storageUpgrade: 0.9,
    cpuUpgrade: 0.5,
    gpuUpgrade: 0.5,
    repairability: 0.9,
  }),
  Traveler: vector({
    priceValue: 0.65,
    singleCore: 0.75,
    sustained: 0.5,
    quietness: 1,
    windows: 0.75,
    linux: 0.55,
    storageUpgrade: 0.45,
    display: 0.65,
    portability: 1.4,
    repairability: 0.45,
    efficiency: 1.2,
  }),
  "Value hunter": vector({
    priceValue: 1.5,
    singleCore: 0.7,
    multiCore: 0.7,
    sustained: 0.7,
    quietness: 0.4,
    gaming: 0.65,
    windows: 0.65,
    linux: 0.6,
    ramUpgrade: 0.8,
    storageUpgrade: 0.8,
    repairability: 0.65,
    efficiency: 0.6,
  }),
};

const priorityFeatureMap: Record<DecisionPriority, MlFeatureKey[]> = {
  performance: ["singleCore", "multiCore", "sustained", "gaming"],
  upgradeability: [
    "ramUpgrade",
    "storageUpgrade",
    "cpuUpgrade",
    "gpuUpgrade",
    "repairability",
  ],
  compatibility: ["windows", "linux", "arch", "atlas"],
  display: ["display"],
  value: ["priceValue"],
  portability: ["portability", "quietness", "efficiency"],
};

export function runMlRecommendation({
  machines,
  workload,
  decisionWeights,
  archetype = "Auto",
}: {
  machines: MachineProfile[];
  workload: string;
  decisionWeights: DecisionWeights;
  archetype?: WorkloadArchetype;
}): MlRecommendation {
  if (!machines.length) {
    throw new Error("At least one machine is required for ML recommendations.");
  }

  const resolvedArchetype =
    archetype === "Auto" ? inferArchetype(workload) : archetype;
  const featureWeights = combineWeights(
    archetypeWeights[resolvedArchetype],
    decisionWeights,
    workload,
  );
  const trainingData = generateTrainingData(machines);
  const forest = trainDecisionForest(trainingData, resolvedArchetype, 36);
  const rawPredictions = machines.map((machine) =>
    predictMachine({
      machine,
      machines,
      trainingData,
      forest,
      archetype: resolvedArchetype,
      featureWeights,
    }),
  );
  const ranked = rawPredictions
    .sort((a, b) => b.ensembleScore - a.ensembleScore)
    .map((prediction, index) => ({ ...prediction, rank: index + 1 }));
  const paretoFrontier = findParetoFrontier(ranked, featureWeights);
  const predictions = ranked.map((prediction) => ({
    ...prediction,
    paretoEfficient: paretoFrontier.includes(prediction.machine.id),
    uncertainty: {
      ...prediction.uncertainty,
      winProbability: estimateWinProbability(prediction, ranked),
    },
    counterfactuals:
      prediction.rank === 1
        ? []
        : buildCounterfactuals(prediction, ranked[0], featureWeights),
  }));
  const winner = predictions[0];
  const consensus = calculateConsensus(winner);

  return {
    archetype: resolvedArchetype,
    winner,
    predictions,
    featureWeights,
    paretoFrontier: predictions
      .filter((prediction) => prediction.paretoEfficient)
      .map((prediction) => prediction.machine.name),
    consensus,
    summary: buildSummary(winner, resolvedArchetype, consensus),
    sensitivity: runSensitivityAnalysis(machines, workload, decisionWeights),
  };
}

export function extractFeatureVector(machine: MachineProfile): FeatureVector {
  const text = [
    machine.ram,
    machine.storage,
    machine.upgradeability.ram,
    machine.upgradeability.storage,
    machine.upgradeability.cpuSocket,
    machine.upgradeability.gpuPath,
  ]
    .join(" ")
    .toLowerCase();
  const desktopLike =
    machine.class === "Desktop" || machine.class === "Workstation";
  const laptop = machine.class === "Laptop";
  const mini = machine.class === "Mini PC";
  const ramUpgrade = text.includes("soldered")
    ? 28
    : text.includes("two") || text.includes("four")
      ? 94
      : 76;
  const storageUpgrade =
    text.includes("multiple") || text.includes("dual") || text.includes("two m.2")
      ? 94
      : text.includes("replaceable") || text.includes("one m.2")
        ? 76
        : 58;
  const cpuUpgrade = desktopLike
    ? 94
    : text.includes("replaceable mainboard")
      ? 78
      : 24;
  const gpuUpgrade = desktopLike
    ? 96
    : text.includes("egpu")
      ? 68
      : text.includes("rtx")
        ? 54
        : 38;
  const display =
    machine.displaySupport.ultrawide45 === "Excellent"
      ? 96
      : machine.displaySupport.ultrawide45 === "Good"
        ? 82
        : machine.displaySupport.ultrawide45 === "Limited"
          ? 55
          : 45;
  const portability = laptop ? 90 : mini ? 72 : 28;
  const repairability = desktopLike
    ? 96
    : text.includes("replaceable mainboard")
      ? 98
      : text.includes("soldered")
        ? 52
        : 78;
  const efficiency = mini
    ? 92
    : laptop
      ? clamp(Math.round((machine.benchmarks.fanNoise + 82) / 2))
      : 62;

  return {
    priceValue: clamp(Math.round(112 - machine.price / 20)),
    singleCore: machine.benchmarks.singleCore,
    multiCore: machine.benchmarks.multiCore,
    sustained: machine.benchmarks.sustainedLoad,
    quietness: machine.benchmarks.fanNoise,
    gaming: machine.benchmarks.gaming1080p,
    windows: machine.osFlexibility.windows11,
    linux: machine.osFlexibility.linux,
    arch: machine.osFlexibility.arch,
    atlas: machine.osFlexibility.atlasOs,
    ramUpgrade,
    storageUpgrade,
    cpuUpgrade,
    gpuUpgrade,
    display,
    portability,
    repairability,
    efficiency,
  };
}

function predictMachine({
  machine,
  machines,
  trainingData,
  forest,
  archetype,
  featureWeights,
}: {
  machine: MachineProfile;
  machines: MachineProfile[];
  trainingData: TrainingSample[];
  forest: DecisionStump[];
  archetype: Exclude<WorkloadArchetype, "Auto">;
  featureWeights: FeatureVector;
}): MachineMlPrediction {
  const machineVector = extractFeatureVector(machine);
  const modelScores: MlModelScore[] = [
    {
      model: "Utility model",
      score: Math.round(weightedUtility(machineVector, featureWeights)),
      weight: 0.34,
    },
    {
      model: "K-nearest neighbors",
      score: predictKnn(machineVector, trainingData, archetype, 9),
      weight: 0.24,
    },
    {
      model: "Decision forest",
      score: predictForest(machineVector, forest),
      weight: 0.24,
    },
    {
      model: "Bayesian fit",
      score: predictBayesianFit(machineVector, featureWeights),
      weight: 0.18,
    },
  ];
  const ensembleScore = clamp(
    Math.round(
      modelScores.reduce(
        (sum, model) => sum + model.score * model.weight,
        0,
      ),
    ),
  );
  const contributions = getFeatureContributions(machineVector, featureWeights);
  const uncertainty = runMonteCarlo(
    machineVector,
    featureWeights,
    `${machine.id}-${archetype}`,
  );
  const modelSpread = standardDeviation(
    modelScores.map((model) => model.score),
  );
  const confidence = clamp(
    Math.round(100 - modelSpread * 2.2 - (uncertainty.high - uncertainty.low)),
  );

  return {
    machine,
    vector: machineVector,
    ensembleScore,
    confidence,
    rank: machines.length,
    modelScores,
    strongestSignals: contributions.slice(0, 5),
    weakestSignals: [...contributions]
      .sort((a, b) => a.contribution - b.contribution)
      .slice(0, 4),
    uncertainty,
    counterfactuals: [],
    paretoEfficient: false,
  };
}

function combineWeights(
  baseWeights: FeatureVector,
  decisionWeights: DecisionWeights,
  workload: string,
) {
  const combined = { ...baseWeights };

  (Object.keys(priorityFeatureMap) as DecisionPriority[]).forEach((priority) => {
    const factor = 0.5 + decisionWeights[priority] / 100;
    priorityFeatureMap[priority].forEach((feature) => {
      combined[feature] *= factor;
    });
  });

  const keywords = workload.toLowerCase();
  const boosts: Array<[string[], MlFeatureKey[], number]> = [
    [["docker", "compile", "development", "code"], ["multiCore", "sustained", "ramUpgrade"], 0.35],
    [["game", "gaming", "fps", "esports"], ["gaming", "singleCore", "display"], 0.45],
    [["linux", "arch", "ubuntu", "fedora"], ["linux", "arch", "repairability"], 0.45],
    [["travel", "portable", "battery", "school"], ["portability", "efficiency", "quietness"], 0.4],
    [["video", "creator", "render", "photo"], ["multiCore", "sustained", "storageUpgrade"], 0.4],
    [["budget", "cheap", "deal", "discount"], ["priceValue", "repairability"], 0.5],
    [["ultrawide", "monitor", "display", "4k"], ["display", "gpuUpgrade"], 0.45],
  ];

  boosts.forEach(([terms, features, boost]) => {
    if (terms.some((term) => keywords.includes(term))) {
      features.forEach((feature) => {
        combined[feature] += boost;
      });
    }
  });

  return normalizeWeights(combined);
}

function inferArchetype(
  workload: string,
): Exclude<WorkloadArchetype, "Auto"> {
  const text = workload.toLowerCase();
  const matches: Array<{
    archetype: Exclude<WorkloadArchetype, "Auto">;
    terms: string[];
  }> = [
    { archetype: "Gaming", terms: ["game", "gaming", "fps", "esports", "steam"] },
    { archetype: "Creator", terms: ["video", "photo", "render", "creator", "adobe", "cad"] },
    { archetype: "Linux power user", terms: ["linux", "arch", "ubuntu", "fedora", "kernel"] },
    { archetype: "Traveler", terms: ["travel", "portable", "battery", "commute", "school"] },
    { archetype: "Value hunter", terms: ["budget", "cheap", "discount", "deal", "value"] },
    { archetype: "Developer", terms: ["code", "developer", "docker", "react", "compile", "server"] },
  ];
  const scored = matches
    .map((match) => ({
      ...match,
      score: match.terms.filter((term) => text.includes(term)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0].score > 0 ? scored[0].archetype : "Developer";
}

function generateTrainingData(machines: MachineProfile[]): TrainingSample[] {
  const samples: TrainingSample[] = [];
  const archetypes = Object.keys(archetypeWeights) as Array<
    Exclude<WorkloadArchetype, "Auto">
  >;

  archetypes.forEach((archetype, archetypeIndex) => {
    machines.forEach((machine, machineIndex) => {
      const baseVector = extractFeatureVector(machine);
      for (let variation = 0; variation < 8; variation += 1) {
        const seed = `${archetype}-${machine.id}-${variation}`;
        const perturbed = perturbVector(baseVector, seed, 5 + variation * 0.4);
        const baseTarget = weightedUtility(
          perturbed,
          normalizeWeights(archetypeWeights[archetype]),
        );
        const calibration =
          ((archetypeIndex + 1) * 3 + (machineIndex + 1) * 5 + variation) % 7;
        samples.push({
          vector: perturbed,
          target: clamp(Math.round(baseTarget - 3 + calibration)),
          archetype,
        });
      }
    });
  });

  return samples;
}

function trainDecisionForest(
  samples: TrainingSample[],
  archetype: Exclude<WorkloadArchetype, "Auto">,
  treeCount: number,
) {
  const relevant = samples.filter((sample) => sample.archetype === archetype);
  const forest: DecisionStump[] = [];

  for (let tree = 0; tree < treeCount; tree += 1) {
    const feature = featureKeys[tree % featureKeys.length];
    const thresholds = [45, 55, 65, 75, 85, 92];
    const threshold = thresholds[(tree * 7 + featureKeys.indexOf(feature)) % thresholds.length];
    const lowSamples = relevant.filter((sample) => sample.vector[feature] < threshold);
    const highSamples = relevant.filter((sample) => sample.vector[feature] >= threshold);
    const lowPrediction = average(lowSamples.map((sample) => sample.target), 50);
    const highPrediction = average(highSamples.map((sample) => sample.target), 70);
    const error = average(
      relevant.map((sample) => {
        const prediction =
          sample.vector[feature] >= threshold ? highPrediction : lowPrediction;
        return Math.abs(prediction - sample.target);
      }),
      20,
    );

    forest.push({
      feature,
      threshold,
      lowPrediction,
      highPrediction,
      error,
    });
  }

  return forest.sort((a, b) => a.error - b.error).slice(0, 24);
}

function predictForest(vectorValue: FeatureVector, forest: DecisionStump[]) {
  if (!forest.length) return 50;
  const weightedPredictions = forest.map((stump) => {
    const prediction =
      vectorValue[stump.feature] >= stump.threshold
        ? stump.highPrediction
        : stump.lowPrediction;
    const reliability = 1 / Math.max(stump.error, 1);
    return { prediction, reliability };
  });
  const reliabilityTotal = weightedPredictions.reduce(
    (sum, item) => sum + item.reliability,
    0,
  );

  return clamp(
    Math.round(
      weightedPredictions.reduce(
        (sum, item) => sum + item.prediction * item.reliability,
        0,
      ) / reliabilityTotal,
    ),
  );
}

function predictKnn(
  target: FeatureVector,
  samples: TrainingSample[],
  archetype: Exclude<WorkloadArchetype, "Auto">,
  k: number,
) {
  const neighbors = samples
    .filter((sample) => sample.archetype === archetype)
    .map((sample) => ({
      sample,
      distance: euclideanDistance(target, sample.vector),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k);
  const totalWeight = neighbors.reduce(
    (sum, neighbor) => sum + 1 / Math.max(neighbor.distance, 0.1),
    0,
  );

  return clamp(
    Math.round(
      neighbors.reduce(
        (sum, neighbor) =>
          sum +
          neighbor.sample.target / Math.max(neighbor.distance, 0.1),
        0,
      ) / totalWeight,
    ),
  );
}

function predictBayesianFit(
  vectorValue: FeatureVector,
  weights: FeatureVector,
) {
  const meaningfulFeatures = featureKeys.filter((feature) => weights[feature] > 0.02);
  const logOdds = meaningfulFeatures.reduce((sum, feature) => {
    const centered = (vectorValue[feature] - 68) / 18;
    return sum + centered * weights[feature] * 5;
  }, 0);
  const probability = 1 / (1 + Math.exp(-logOdds));

  return clamp(Math.round(35 + probability * 65));
}

function runMonteCarlo(
  vectorValue: FeatureVector,
  weights: FeatureVector,
  seedText: string,
  samples = 180,
): MonteCarloResult {
  const random = seededRandom(hashString(seedText));
  const scores: number[] = [];

  for (let sample = 0; sample < samples; sample += 1) {
    const noisyVector = vector({}) as FeatureVector;
    const noisyWeights = vector({}) as FeatureVector;

    featureKeys.forEach((feature) => {
      noisyVector[feature] = clamp(
        vectorValue[feature] + gaussian(random) * featureNoise(feature),
      );
      noisyWeights[feature] = Math.max(
        0,
        weights[feature] * (0.82 + random() * 0.36),
      );
    });
    scores.push(weightedUtility(noisyVector, normalizeWeights(noisyWeights)));
  }

  scores.sort((a, b) => a - b);

  return {
    mean: Math.round(average(scores)),
    low: Math.round(percentile(scores, 0.1)),
    high: Math.round(percentile(scores, 0.9)),
    samples,
    winProbability: 0,
  };
}

function getFeatureContributions(
  vectorValue: FeatureVector,
  weights: FeatureVector,
) {
  return featureKeys
    .map((feature) => ({
      feature,
      label: mlFeatureLabels[feature],
      value: Math.round(vectorValue[feature]),
      importance: round(weights[feature] * 100, 1),
      contribution: round(vectorValue[feature] * weights[feature], 2),
    }))
    .sort((a, b) => b.contribution - a.contribution);
}

function buildCounterfactuals(
  prediction: MachineMlPrediction,
  winner: MachineMlPrediction,
  weights: FeatureVector,
) {
  const scoreGap = Math.max(1, winner.ensembleScore - prediction.ensembleScore);

  return featureKeys
    .map((feature) => {
      const availableGain = 100 - prediction.vector[feature];
      const requiredGain = Math.min(
        availableGain,
        Math.ceil(scoreGap / Math.max(weights[feature], 0.01)),
      );
      const scoreGain = Math.round(requiredGain * weights[feature]);

      return {
        feature,
        label: mlFeatureLabels[feature],
        currentValue: prediction.vector[feature],
        targetValue: clamp(prediction.vector[feature] + requiredGain),
        scoreGain,
        explanation: `${mlFeatureLabels[feature]} would need to rise from ${Math.round(
          prediction.vector[feature],
        )} to about ${clamp(
          Math.round(prediction.vector[feature] + requiredGain),
        )} to close roughly ${scoreGain} points.`,
      };
    })
    .filter((item) => item.scoreGain > 0)
    .sort((a, b) => b.scoreGain - a.scoreGain)
    .slice(0, 3);
}

function findParetoFrontier(
  predictions: MachineMlPrediction[],
  weights: FeatureVector,
) {
  const importantFeatures = featureKeys
    .filter((feature) => weights[feature] > 0.035)
    .slice(0, 10);

  return predictions
    .filter(
      (candidate) =>
        !predictions.some(
          (other) =>
            other.machine.id !== candidate.machine.id &&
            importantFeatures.every(
              (feature) => other.vector[feature] >= candidate.vector[feature],
            ) &&
            importantFeatures.some(
              (feature) => other.vector[feature] > candidate.vector[feature],
            ),
        ),
    )
    .map((prediction) => prediction.machine.id);
}

function runSensitivityAnalysis(
  machines: MachineProfile[],
  workload: string,
  baseDecisionWeights: DecisionWeights,
) {
  return (Object.keys(priorityFeatureMap) as DecisionPriority[]).map((priority) => {
    const altered = { ...baseDecisionWeights, [priority]: 100 };
    const weights = combineWeights(
      archetypeWeights[inferArchetype(workload)],
      altered,
      workload,
    );
    const winner = machines
      .map((machine) => ({
        machine,
        score: weightedUtility(extractFeatureVector(machine), weights),
      }))
      .sort((a, b) => b.score - a.score)[0];

    return {
      priority,
      winner: winner.machine.name,
      score: Math.round(winner.score),
    };
  });
}

function calculateConsensus(winner: MachineMlPrediction) {
  const modelWins = winner.modelScores.filter(
    (model) => model.score >= winner.ensembleScore - 5,
  ).length;
  return clamp(
    Math.round(
      (modelWins / winner.modelScores.length) * 60 + winner.confidence * 0.4,
    ),
  );
}

function estimateWinProbability(
  prediction: MachineMlPrediction,
  predictions: MachineMlPrediction[],
) {
  if (predictions.length === 1) return 100;
  const exponentials = predictions.map((item) =>
    Math.exp((item.uncertainty.mean - 70) / 8),
  );
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  const index = predictions.findIndex(
    (item) => item.machine.id === prediction.machine.id,
  );
  return clamp(Math.round((exponentials[index] / total) * 100));
}

function buildSummary(
  winner: MachineMlPrediction,
  archetype: Exclude<WorkloadArchetype, "Auto">,
  consensus: number,
) {
  const topSignals = winner.strongestSignals
    .slice(0, 3)
    .map((signal) => signal.label.toLowerCase())
    .join(", ");

  return `${winner.machine.name} is the ensemble winner for the ${archetype.toLowerCase()} profile, driven by ${topSignals}. Model consensus is ${consensus}%.`;
}

function weightedUtility(vectorValue: FeatureVector, weights: FeatureVector) {
  return clamp(
    featureKeys.reduce(
      (sum, feature) => sum + vectorValue[feature] * weights[feature],
      0,
    ),
  );
}

function normalizeWeights(weights: FeatureVector) {
  const total = featureKeys.reduce((sum, feature) => sum + weights[feature], 0) || 1;
  return featureKeys.reduce(
    (result, feature) => {
      result[feature] = weights[feature] / total;
      return result;
    },
    vector({}) as FeatureVector,
  );
}

function perturbVector(
  input: FeatureVector,
  seedText: string,
  amount: number,
) {
  const random = seededRandom(hashString(seedText));
  return featureKeys.reduce(
    (result, feature) => {
      result[feature] = clamp(
        input[feature] + (random() - 0.5) * amount * 2,
      );
      return result;
    },
    vector({}) as FeatureVector,
  );
}

function euclideanDistance(a: FeatureVector, b: FeatureVector) {
  return Math.sqrt(
    featureKeys.reduce((sum, feature) => {
      const difference = a[feature] - b[feature];
      return sum + difference * difference;
    }, 0) / featureKeys.length,
  );
}

function featureNoise(feature: MlFeatureKey) {
  if (["priceValue", "gaming", "sustained", "quietness"].includes(feature)) return 6;
  if (["cpuUpgrade", "gpuUpgrade", "ramUpgrade", "storageUpgrade"].includes(feature)) return 3;
  return 4;
}

function vector(values: Partial<FeatureVector>): FeatureVector {
  return featureKeys.reduce(
    (result, feature) => {
      result[feature] = values[feature] ?? 0;
      return result;
    },
    {} as FeatureVector,
  );
}

function average(values: number[], fallback = 0) {
  if (!values.length) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
}

function percentile(values: number[], fraction: number) {
  if (!values.length) return 0;
  const index = Math.min(values.length - 1, Math.max(0, Math.floor(values.length * fraction)));
  return values[index];
}

function gaussian(random: () => number) {
  const first = Math.max(random(), Number.EPSILON);
  const second = Math.max(random(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function round(value: number, places: number) {
  const multiplier = 10 ** places;
  return Math.round(value * multiplier) / multiplier;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
