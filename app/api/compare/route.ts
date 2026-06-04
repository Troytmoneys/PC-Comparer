import { NextResponse } from "next/server";

import { comparisonDimensionCount } from "@/data/comparisonAtlas";
import { featureBlueprint } from "@/data/features";
import { generateGroundedJson, GeminiError } from "@/lib/gemini";

export const runtime = "nodejs";

type CompareRequest = {
  machines?: string[];
  workload?: string;
  discountProfile?: {
    student?: boolean;
    military?: boolean;
    educator?: boolean;
    healthcare?: boolean;
    openBox?: boolean;
    refurbished?: boolean;
    preferredRetailers?: string;
  };
  mlContext?: {
    winner?: string;
    winnerScore?: number;
    confidence?: number;
    consensus?: number;
    archetype?: string;
    ranking?: Array<{
      machine: string;
      score: number;
      confidence: number;
    }>;
    strongestSignals?: string[];
  };
};

type CompareResponse = {
  verdict: string;
  winnerByWorkload: string;
  matrix: Array<{
    machine: string;
    display: string;
    osFlexibility: string;
    upgradeability: string;
    performance: string;
    discountPosition: string;
    risks: string[];
  }>;
  dimensionFindings: Array<{
    dimension: string;
    winner: string;
    reason: string;
  }>;
  discountOpportunities: Array<{
    machine: string;
    retailer: string;
    opportunity: string;
    confidence: number;
    sourceUrl?: string;
  }>;
  sourcesChecked: string[];
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CompareRequest;

    if (!body.machines?.length) {
      return NextResponse.json(
        { error: "At least one machine is required." },
        { status: 400 },
      );
    }

    const comparisonDimensions = featureBlueprint
      .map((feature) => `${feature.category}: ${feature.title}`)
      .join("\n");
    const discountProfile = body.discountProfile
      ? Object.entries(body.discountProfile)
          .filter(([, value]) => Boolean(value))
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join(", ")
      : "Public discounts only";
    const mlContext = body.mlContext
      ? JSON.stringify(body.mlContext, null, 2)
      : "No local ML recommendation supplied.";

    const prompt = `
You are a hardware comparison analyst. Use Google Search grounding to verify current specs.
Compare these machines: ${body.machines.join(", ")}.
Workload emphasis: ${body.workload || "balanced development, gaming, and daily use"}.
Today is ${new Date().toLocaleDateString("en-US", {
      dateStyle: "long",
      timeZone: "America/Chicago",
    })}. The buyer is in the United States.
Laptop savings profile: ${discountProfile}.

The local explainable ML ensemble produced this recommendation context:
${mlContext}

Use live search to audit the ML conclusion. Explicitly say when current facts confirm it, weaken it, or overturn it. Do not accept the ML winner blindly.

This app has ${comparisonDimensionCount} local comparison dimensions. Use the list below as the audit checklist and call out the dimensions that materially change the buying decision:
${comparisonDimensions}

Evaluate:
- External display limitations, including 45-inch ultrawide support and HDMI vs DisplayPort refresh ceilings.
- OS flexibility for Windows 11, Arch Linux, mainstream Linux, and AtlasOS-style debloated Windows installs.
- Upgradeability paths: RAM soldered vs SODIMM/DIMM, storage slots, CPU socket, GPU path.
- Practical risks: firmware, Wi-Fi chipset, thermals, fan noise, warranty constraints.
- Current discounts, sale price credibility, coupon/public discount opportunities, stock condition, and whether a deal looks meaningfully better than normal pricing.
- For laptops, actively search official manufacturer programs and major retailer offers that match the savings profile. Never claim an eligibility discount unless the user profile says they qualify.
- Explain how to apply each verified public coupon or eligible discount at checkout, but do not invent codes or imply that checkout was completed.

Return strict JSON only:
{
  "verdict": "short winner and why",
  "winnerByWorkload": "machine name",
  "matrix": [
    {
      "machine": "name",
      "display": "display capabilities",
      "osFlexibility": "OS notes",
      "upgradeability": "upgrade notes",
      "performance": "performance notes",
      "discountPosition": "current deal and discount notes",
      "risks": ["risk"]
    }
  ],
  "dimensionFindings": [
    {
      "dimension": "one of the supplied checklist dimensions",
      "winner": "machine name",
      "reason": "why it matters"
    }
  ],
  "discountOpportunities": [
    {
      "machine": "machine name",
      "retailer": "retailer name",
      "opportunity": "sale/coupon/open-box/price-match opportunity",
      "confidence": 0,
      "sourceUrl": "https://..."
    }
  ],
  "sourcesChecked": ["source summary"]
}
`;

    const { value, sources, webSearchQueries } =
      await generateGroundedJson<CompareResponse>(prompt);

    return NextResponse.json({
      ...value,
      groundingSources: sources,
      webSearchQueries,
    });
  } catch (error) {
    const status = error instanceof GeminiError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Comparison request failed.";

    return NextResponse.json({ error: message }, { status });
  }
}
