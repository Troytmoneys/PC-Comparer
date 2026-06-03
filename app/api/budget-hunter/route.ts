import { NextResponse } from "next/server";

import { generateGroundedJson, GeminiError } from "@/lib/gemini";
import type { BudgetHunterResponse } from "@/types/pc";

export const runtime = "nodejs";

type BudgetHunterRequest = {
  budget?: string;
  useCase?: string;
  constraints?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as BudgetHunterRequest;
    const budget = body.budget?.trim();
    const useCase = body.useCase?.trim();
    const constraints = body.constraints?.trim() || "No extra constraints.";

    if (!budget || !useCase) {
      return NextResponse.json(
        { error: "Budget and use case are required." },
        { status: 400 },
      );
    }

    const prompt = buildBudgetPrompt(budget, useCase, constraints);
    const { value, sources, webSearchQueries } =
      await generateGroundedJson<BudgetHunterResponse>(prompt);

    return NextResponse.json({
      ...value,
      verifiedAt: value.verifiedAt ?? new Date().toISOString(),
      groundingSources: sources,
      webSearchQueries,
    });
  } catch (error) {
    const status = error instanceof GeminiError ? error.status : 500;
    const message =
      error instanceof Error ? error.message : "Budget Hunter request failed.";

    return NextResponse.json({ error: message }, { status });
  }
}

function buildBudgetPrompt(budget: string, useCase: string, constraints: string) {
  return `
You are Budget Hunter, a PC and laptop deal analyst.
Today is ${new Date().toLocaleDateString("en-US", {
    dateStyle: "long",
    timeZone: "America/Chicago",
  })}. The buyer is in the United States.

Task:
- Find the best current laptop, desktop, mini PC, or workstation deals for a strict budget of ${budget}.
- Primary use case: ${useCase}.
- User constraints: ${constraints}.
- Use live Google Search grounding. Do not invent prices, availability, coupons, or retailers.
- Prefer products that are actually purchasable today in the United States.
- Include exact make, model, current price, retailer, and direct retailer URL.
- Find and verify discounts: sale price vs list price, coupon codes, instant rebates, open-box/refurb deals, student/military/public discounts, bundle savings, and price-match opportunities.
- For every discount, state whether it is public, conditional, expired-risk, or needs checkout verification.
- Explain why the top pick beats close alternatives for this use case.
- Reject options that exceed the budget after obvious shipping or configuration costs.
- Include confidence scores based on how direct and recent the source evidence is.
- Prefer official retailer pages over scraped coupon sites unless a coupon site is the only source for a code.

Return strict JSON only with this TypeScript shape:
{
  "summary": "short recommendation summary",
  "verifiedAt": "ISO timestamp or date verified",
  "picks": [
    {
      "rank": 1,
      "make": "brand",
      "model": "exact model/configuration",
      "currentPrice": "$000.00",
      "listPrice": "$000.00 or null if not verified",
      "discountAmount": "$000.00 or null if not verified",
      "discountPercent": 0,
      "retailer": "retailer name",
      "link": "https://...",
      "availability": "in stock / limited / open-box / refurbished / unknown",
      "couponCodes": ["code or public discount note"],
      "dealQuality": "Excellent | Good | Fair | Weak",
      "lastVerified": "short timestamp or date",
      "confidence": 0,
      "fitScore": 0,
      "whyItFits": "specific reason tied to use case",
      "caveats": ["specific caveat"],
      "comparedAgainst": ["alternative model and why it lost"],
      "evidence": [
        {
          "claim": "price or discount claim",
          "sourceUrl": "https://..."
        }
      ]
    }
  ],
  "tradeoffs": ["budget tradeoff"],
  "discountStrategy": ["how the user should capture the deal or avoid fake savings"],
  "budgetMath": ["price + shipping/tax/config note"],
  "searchNotes": ["what was verified via current search"]
}
`;
}
