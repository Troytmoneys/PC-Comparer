"use client";

import {
  Bot,
  ExternalLink,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { FormEvent, useState } from "react";

import type { BudgetHunterResponse } from "@/types/pc";

type ApiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: BudgetHunterResponse }
  | { status: "error"; message: string };

export function BudgetHunter() {
  const [budget, setBudget] = useState("600");
  const [useCase, setUseCase] = useState("React development and daily browsing");
  const [constraints, setConstraints] = useState(
    "Prefer 16 GB RAM, quiet fans, upgradeable storage, and easy returns.",
  );
  const [state, setState] = useState<ApiState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/budget-hunter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, useCase, constraints }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Budget Hunter failed.");
      }

      setState({ status: "success", data: payload });
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error.",
      });
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-wide text-ember">
            The Budget Hunter
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950 sm:text-4xl">
            AI deal hunting with live grounded search
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Enter a strict budget and primary workload. The server constructs a
            grounded Gemini prompt and asks for current prices, retailers,
            availability, caveats, and direct links.
          </p>
        </div>
        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900 lg:max-w-xs">
          <div className="flex items-center gap-2 font-black">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            Server-only API key
          </div>
          <p className="mt-2 leading-5">
            Gemini calls stay in Next.js route handlers and include Google
            Search grounding for current deals and specs.
          </p>
        </div>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]" onSubmit={submit}>
        <label className="grid gap-2 text-sm font-bold text-slate-600">
          Strict budget
          <div className="flex overflow-hidden rounded-md border border-slate-300 bg-white focus-within:border-sage focus-within:ring-4 focus-within:ring-teal-100">
            <span className="grid w-10 place-items-center text-slate-500">$</span>
            <input
              className="min-h-12 w-full border-0 px-1 text-slate-950"
              inputMode="numeric"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              placeholder="600"
            />
          </div>
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-600">
          Primary use case
          <input
            className="min-h-12 rounded-md border border-slate-300 px-3 text-slate-950 focus:border-sage focus:ring-4 focus:ring-teal-100"
            value={useCase}
            onChange={(event) => setUseCase(event.target.value)}
            placeholder="game server hosting, React development, browsing"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-600 lg:col-span-2">
          Constraints
          <textarea
            className="min-h-24 rounded-md border border-slate-300 px-3 py-3 text-slate-950 focus:border-sage focus:ring-4 focus:ring-teal-100"
            value={constraints}
            onChange={(event) => setConstraints(event.target.value)}
            placeholder="Ports, OS preference, display needs, upgrade path, retailers"
          />
        </label>

        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-sage px-4 font-black text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 lg:col-span-2"
          type="submit"
          disabled={state.status === "loading"}
        >
          {state.status === "loading" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
          Hunt current deals
        </button>
      </form>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-slate-100 p-3 text-sm leading-5 text-slate-600">
        <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Model: <strong>gemini-3.5-flash</strong> by default. Grounding payload:
          <code className="ml-1 rounded bg-white px-1.5 py-0.5 text-slate-900">
            {"tools: [{ google_search: {} }]"}
          </code>
        </span>
      </div>

      {state.status === "error" && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {state.message} Add <code>GEMINI_API_KEY</code> to{" "}
          <code>.env.local</code> before live deal hunting.
        </div>
      )}

      {state.status === "success" && (
        <div className="mt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950">
                {state.data.summary}
              </h3>
              {state.data.verifiedAt && (
                <p className="mt-1 text-sm font-bold text-slate-500">
                  Verified {state.data.verifiedAt}
                </p>
              )}
            </div>
            {!!state.data.webSearchQueries?.length && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                {state.data.webSearchQueries.length} grounded searches
              </span>
            )}
          </div>
          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            {state.data.picks.map((pick) => (
              <article
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                key={`${pick.rank}-${pick.model}`}
              >
                <div className="flex items-center justify-between gap-4 font-black text-sage">
                  <span>#{pick.rank}</span>
                  <strong>{pick.currentPrice}</strong>
                </div>
                {(pick.discountAmount || pick.discountPercent || pick.listPrice) && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                    {pick.listPrice && (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                        List {pick.listPrice}
                      </span>
                    )}
                    {pick.discountAmount && (
                      <span className="rounded-full bg-teal-50 px-2 py-1 text-teal-800">
                        Save {pick.discountAmount}
                      </span>
                    )}
                    {!!pick.discountPercent && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-800">
                        {pick.discountPercent}% off
                      </span>
                    )}
                  </div>
                )}
                <h4 className="mt-3 text-lg font-black text-slate-950">
                  {pick.make} {pick.model}
                </h4>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                  {pick.dealQuality && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-800">
                      {pick.dealQuality} deal
                    </span>
                  )}
                  {pick.availability && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                      {pick.availability}
                    </span>
                  )}
                  {!!pick.confidence && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">
                      {pick.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{pick.whyItFits}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className="block h-full rounded-full bg-sage"
                    style={{ width: `${Math.min(pick.fitScore, 100)}%` }}
                  />
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-5 text-slate-600">
                  {pick.caveats.slice(0, 3).map((caveat) => (
                    <li key={caveat}>{caveat}</li>
                  ))}
                </ul>
                {!!pick.couponCodes?.length && (
                  <div className="mt-3 rounded-md bg-slate-50 p-3 text-sm leading-5 text-slate-600">
                    <strong className="text-slate-950">Discounts: </strong>
                    {pick.couponCodes.join(", ")}
                  </div>
                )}
                {!!pick.evidence?.length && (
                  <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600">
                    {pick.evidence.slice(0, 2).map((item) => (
                      <a
                        className="rounded-md bg-slate-50 p-2 font-bold text-cobalt"
                        href={item.sourceUrl || pick.link}
                        target="_blank"
                        rel="noreferrer"
                        key={`${pick.model}-${item.claim}`}
                      >
                        {item.claim}
                      </a>
                    ))}
                  </div>
                )}
                <a
                  className="mt-4 inline-flex items-center gap-2 text-sm font-black text-cobalt"
                  href={pick.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  {pick.retailer}
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
          {!!state.data.discountStrategy?.length && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h4 className="font-black text-slate-950">Discount strategy</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                {state.data.discountStrategy.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {!!state.data.budgetMath?.length && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <h4 className="font-black text-slate-950">Budget math</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                {state.data.budgetMath.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {!!state.data.groundingSources?.length && (
            <div className="mt-4 flex flex-wrap gap-3">
              {state.data.groundingSources.slice(0, 6).map((source) => (
                <a
                  className="text-sm font-black text-cobalt"
                  href={source.uri}
                  key={source.uri}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title || source.uri}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {state.status === "idle" && (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["Budget integrity", "Rejects picks over budget after obvious configuration costs."],
            ["Live retailer links", "Requests direct retailer URLs and current availability."],
            ["Use-case ranking", "Explains why the top pick beats close alternatives."],
          ].map(([title, body]) => (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4" key={title}>
              <Bot className="h-5 w-5 text-sage" aria-hidden="true" />
              <h3 className="mt-3 font-black text-slate-950">{title}</h3>
              <p className="mt-1 text-sm leading-5 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
