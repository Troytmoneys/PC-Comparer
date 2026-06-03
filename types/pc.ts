export type MachineClass = "Laptop" | "Desktop" | "Mini PC" | "Workstation";

export type MachineProfile = {
  id: string;
  name: string;
  class: MachineClass;
  price: number;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  displaySupport: {
    maxResolution: string;
    hdmi: string;
    displayPort: string;
    ultrawide45: "Excellent" | "Good" | "Limited" | "Unknown";
  };
  osFlexibility: {
    windows11: number;
    linux: number;
    arch: number;
    atlasOs: number;
    notes: string;
  };
  upgradeability: {
    ram: string;
    storage: string;
    cpuSocket: string;
    gpuPath: string;
  };
  benchmarks: {
    singleCore: number;
    multiCore: number;
    sustainedLoad: number;
    fanNoise: number;
    gaming1080p: number;
  };
};

export type BudgetHunterPick = {
  rank: number;
  make: string;
  model: string;
  currentPrice: string;
  listPrice?: string;
  discountAmount?: string;
  discountPercent?: number;
  retailer: string;
  link: string;
  availability?: string;
  couponCodes?: string[];
  dealQuality?: "Excellent" | "Good" | "Fair" | "Weak";
  lastVerified?: string;
  confidence?: number;
  fitScore: number;
  whyItFits: string;
  caveats: string[];
  comparedAgainst: string[];
  evidence?: Array<{
    claim: string;
    sourceUrl?: string;
  }>;
};

export type BudgetHunterResponse = {
  summary: string;
  verifiedAt?: string;
  picks: BudgetHunterPick[];
  tradeoffs: string[];
  discountStrategy?: string[];
  budgetMath?: string[];
  searchNotes: string[];
  groundingSources?: { title?: string; uri?: string }[];
  webSearchQueries?: string[];
};
