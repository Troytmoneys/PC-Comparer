import {
  type FeatureCategory,
  type FeatureDefinition,
  featureBlueprint,
} from "@/data/features";
import type { MachineProfile } from "@/types/pc";

export type ComparisonVerdict = {
  feature: FeatureDefinition;
  value: string;
  score: number;
  note: string;
};

export type DecisionPriority =
  | "performance"
  | "upgradeability"
  | "compatibility"
  | "display"
  | "value"
  | "portability";

export type DecisionWeights = Record<DecisionPriority, number>;

export type DecisionBreakdown = Record<DecisionPriority, number> & {
  total: number;
};

export const comparisonCategories = [
  "All",
  ...Array.from(new Set(featureBlueprint.map((feature) => feature.category))),
] as const;

export type ComparisonCategoryFilter = (typeof comparisonCategories)[number];

export const comparisonDimensionCount = featureBlueprint.length;

export function getFeatureVerdict(
  machine: MachineProfile,
  feature: FeatureDefinition,
): ComparisonVerdict {
  const title = feature.title.toLowerCase();
  const score = scoreFeature(machine, feature.category, title);

  return {
    feature,
    value: describeValue(machine, feature.category, title),
    score,
    note: describeNote(machine, feature.category, title, score),
  };
}

export function getMachineAtlasScore(machine: MachineProfile) {
  const total = featureBlueprint.reduce(
    (sum, feature) => sum + scoreFeature(machine, feature.category, feature.title.toLowerCase()),
    0,
  );

  return Math.round(total / featureBlueprint.length);
}

export function getMachineDecisionBreakdown(
  machine: MachineProfile,
  weights: DecisionWeights,
): DecisionBreakdown {
  const scores: Record<DecisionPriority, number> = {
    performance: performanceScore(machine, "performance"),
    upgradeability: Math.round(
      ["ram", "m.2 storage", "cpu socket", "gpu upgrade"].reduce(
        (sum, title) => sum + hardwareScore(machine, title),
        0,
      ) / 4,
    ),
    compatibility: osScore(machine, "compatibility"),
    display: hardwareScore(machine, "display hdmi usb4"),
    value: dealScore(machine, "price discount budget"),
    portability:
      machine.class === "Laptop"
        ? Math.round((82 + machine.benchmarks.fanNoise) / 2)
        : machine.class === "Mini PC"
          ? 72
          : 34,
  };
  const weightTotal = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const total = Math.round(
    (Object.keys(scores) as DecisionPriority[]).reduce(
      (sum, priority) => sum + scores[priority] * weights[priority],
      0,
    ) / weightTotal,
  );

  return { ...scores, total };
}

export function filterComparisonFeatures(
  category: ComparisonCategoryFilter,
  query: string,
) {
  const normalizedQuery = query.trim().toLowerCase();

  return featureBlueprint.filter((feature) => {
    const categoryMatch = category === "All" || feature.category === category;
    const queryMatch =
      !normalizedQuery ||
      feature.title.toLowerCase().includes(normalizedQuery) ||
      feature.category.toLowerCase().includes(normalizedQuery) ||
      feature.layer.includes(normalizedQuery);

    return categoryMatch && queryMatch;
  });
}

function scoreFeature(
  machine: MachineProfile,
  category: FeatureCategory,
  title: string,
) {
  if (category === "Performance Benchmarking") {
    return performanceScore(machine, title);
  }

  if (category === "OS & Compatibility") {
    return osScore(machine, title);
  }

  if (category === "Pricing Analytics" || category === "AI Deal Intelligence") {
    return dealScore(machine, title);
  }

  if (category === "Advanced Hardware Filtering") {
    return hardwareScore(machine, title);
  }

  if (category === "Educational UI") {
    return clamp(Math.round((hardwareScore(machine, title) + osScore(machine, title)) / 2));
  }

  if (category === "User Accounts & Tracking") {
    return title.includes("price") || title.includes("alert") ? dealScore(machine, title) : 82;
  }

  return title.includes("export") || title.includes("api") ? 92 : 84;
}

function performanceScore(machine: MachineProfile, title: string) {
  const { benchmarks } = machine;
  const sustained = benchmarks.sustainedLoad;
  const average = Math.round(
    (benchmarks.singleCore +
      benchmarks.multiCore +
      benchmarks.sustainedLoad +
      benchmarks.gaming1080p) /
      4,
  );

  if (title.includes("single")) return benchmarks.singleCore;
  if (title.includes("multi") || title.includes("compile") || title.includes("docker")) {
    return Math.round((benchmarks.multiCore + sustained) / 2);
  }
  if (title.includes("gpu") || title.includes("fps") || title.includes("game")) {
    return benchmarks.gaming1080p;
  }
  if (title.includes("noise") || title.includes("fan")) return benchmarks.fanNoise;
  if (title.includes("battery")) return machine.class === "Laptop" ? 78 : machine.class === "Mini PC" ? 52 : 28;
  if (title.includes("watt")) return machine.class === "Mini PC" ? 88 : machine.class === "Laptop" ? 76 : 66;
  if (title.includes("thermal") || title.includes("sustained")) return sustained;

  return average;
}

function osScore(machine: MachineProfile, title: string) {
  const { osFlexibility } = machine;

  if (title.includes("windows") || title.includes("tpm") || title.includes("bitlocker")) {
    return osFlexibility.windows11;
  }
  if (title.includes("arch")) return osFlexibility.arch;
  if (title.includes("linux") || title.includes("ubuntu") || title.includes("fedora")) {
    return osFlexibility.linux;
  }
  if (title.includes("atlas") || title.includes("debloat") || title.includes("telemetry")) {
    return osFlexibility.atlasOs;
  }
  if (title.includes("virtual") || title.includes("docker") || title.includes("wsl")) {
    return Math.round((osFlexibility.windows11 + osFlexibility.linux) / 2);
  }
  if (title.includes("nvidia")) return machine.gpu.toLowerCase().includes("nvidia") ? 72 : 90;
  if (title.includes("amd")) return /ryzen|radeon/i.test(`${machine.cpu} ${machine.gpu}`) ? 91 : 76;

  return Math.round(
    (osFlexibility.windows11 + osFlexibility.linux + osFlexibility.arch + osFlexibility.atlasOs) / 4,
  );
}

function hardwareScore(machine: MachineProfile, title: string) {
  const desktopLike = machine.class === "Desktop" || machine.class === "Workstation";
  const portable = machine.class === "Laptop" || machine.class === "Mini PC";
  const text = `${machine.cpu} ${machine.gpu} ${machine.ram} ${machine.storage} ${machine.upgradeability.ram} ${machine.upgradeability.storage}`.toLowerCase();

  if (title.includes("ram") || title.includes("sodimm") || title.includes("dimm")) {
    if (text.includes("soldered")) return 42;
    if (text.includes("sodimm")) return 86;
    return desktopLike ? 96 : 72;
  }
  if (title.includes("m.2") || title.includes("storage") || title.includes("2.5")) {
    return text.includes("dual") || text.includes("multiple") ? 94 : 74;
  }
  if (title.includes("cpu socket")) return desktopLike ? 92 : 28;
  if (title.includes("gpu") || title.includes("pci")) return desktopLike ? 94 : machine.gpu.includes("RTX") ? 76 : 58;
  if (title.includes("display") || title.includes("hdmi") || title.includes("thunderbolt") || title.includes("usb4")) {
    return machine.displaySupport.ultrawide45 === "Excellent"
      ? 94
      : machine.displaySupport.ultrawide45 === "Good"
        ? 82
        : 58;
  }
  if (title.includes("battery") || title.includes("weight") || title.includes("keyboard") || title.includes("trackpad")) {
    return machine.class === "Laptop" ? 84 : machine.class === "Mini PC" ? 36 : 22;
  }
  if (title.includes("repair") || title.includes("warranty")) {
    return desktopLike ? 92 : text.includes("soldered") ? 56 : 74;
  }
  if (title.includes("wi-fi") || title.includes("bluetooth")) return portable ? 78 : 68;

  return desktopLike ? 86 : portable ? 74 : 78;
}

function dealScore(machine: MachineProfile, title: string) {
  const priceScore = clamp(Math.round(105 - machine.price / 22));

  if (title.includes("budget") || title.includes("price") || title.includes("coupon") || title.includes("discount")) {
    return priceScore;
  }
  if (title.includes("open-box") || title.includes("refurb")) {
    return machine.class === "Laptop" || machine.class === "Mini PC" ? 84 : 72;
  }
  if (title.includes("shipping") || title.includes("tax") || title.includes("return")) return 82;
  if (title.includes("retailer") || title.includes("seller") || title.includes("marketplace")) return 78;
  if (title.includes("bundle")) return machine.class === "Desktop" ? 88 : 76;
  if (title.includes("inventory") || title.includes("clearance")) return machine.price < 800 ? 86 : 72;

  return Math.round((priceScore + performanceScore(machine, "performance")) / 2);
}

function describeValue(
  machine: MachineProfile,
  category: FeatureCategory,
  title: string,
) {
  if (category === "Performance Benchmarking") {
    if (title.includes("single")) return `${machine.benchmarks.singleCore}/100 single-core index`;
    if (title.includes("multi")) return `${machine.benchmarks.multiCore}/100 multi-core index`;
    if (title.includes("noise") || title.includes("fan")) return `${machine.benchmarks.fanNoise}/100 quietness index`;
    if (title.includes("gpu") || title.includes("fps") || title.includes("game")) {
      return `${machine.benchmarks.gaming1080p}/100 graphics workload index`;
    }

    return `${performanceScore(machine, title)}/100 workload confidence`;
  }

  if (category === "OS & Compatibility") {
    if (title.includes("windows")) return `${machine.osFlexibility.windows11}/100 Windows readiness`;
    if (title.includes("arch")) return `${machine.osFlexibility.arch}/100 Arch readiness`;
    if (title.includes("linux")) return `${machine.osFlexibility.linux}/100 Linux readiness`;
    return machine.osFlexibility.notes;
  }

  if (category === "Advanced Hardware Filtering" || category === "Educational UI") {
    if (title.includes("display") || title.includes("hdmi") || title.includes("thunderbolt") || title.includes("usb4")) {
      return `${machine.displaySupport.ultrawide45}: ${machine.displaySupport.displayPort}`;
    }
    if (title.includes("ram")) return machine.upgradeability.ram;
    if (title.includes("storage") || title.includes("m.2")) return machine.upgradeability.storage;
    if (title.includes("cpu socket")) return machine.upgradeability.cpuSocket;
    if (title.includes("gpu")) return machine.upgradeability.gpuPath;
    return `${machine.cpu}, ${machine.gpu}`;
  }

  if (category === "Pricing Analytics" || category === "AI Deal Intelligence") {
    return `$${machine.price.toLocaleString()} baseline, ${dealScore(machine, title)}/100 deal fit`;
  }

  return `${machine.class} profile supports this workflow`;
}

function describeNote(
  machine: MachineProfile,
  category: FeatureCategory,
  title: string,
  score: number,
) {
  if (score >= 90) return "Standout strength for this machine.";
  if (score >= 78) return "Strong fit with a few details worth verifying before purchase.";
  if (score >= 62) return "Usable, but compare the exact configuration and retailer listing.";

  if (category === "Advanced Hardware Filtering" && title.includes("ram")) {
    return "Memory path is the main constraint; avoid under-buying RAM.";
  }
  if (category === "OS & Compatibility") {
    return "Check firmware, driver, and community install reports before committing.";
  }

  return `${machine.name} is weaker on this dimension than the best alternatives.`;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
