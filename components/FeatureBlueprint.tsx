"use client";

import { Download, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  type FeatureCategory,
  featureBlueprint,
  featureCounts,
  totalFeatureCount,
} from "@/data/features";
import { cn } from "@/lib/utils";

const categories = Object.keys(featureCounts) as FeatureCategory[];

export function FeatureBlueprint({
  initialCategory = "Advanced Hardware Filtering",
  compact = false,
}: {
  initialCategory?: FeatureCategory;
  compact?: boolean;
}) {
  const [category, setCategory] = useState<FeatureCategory>(initialCategory);
  const [query, setQuery] = useState("");

  const visibleFeatures = useMemo(
    () =>
      featureBlueprint.filter(
        (feature) =>
          feature.category === category &&
          feature.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, query],
  );

  const csv = useMemo(
    () =>
      [
        "id,category,title,layer,status",
        ...featureBlueprint.map((feature) =>
          [feature.id, feature.category, feature.title, feature.layer, feature.status]
            .map((value) => `"${value.replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n"),
    [],
  );

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-ember">
            Feature Architecture
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-normal text-slate-950 sm:text-3xl">
            {totalFeatureCount}-feature blueprint
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            A typed registry for filters, metrics, account workflows, education,
            pricing intelligence, and developer tools. These records can seed
            the <code className="rounded bg-slate-100 px-1">feature_definition</code>{" "}
            database table.
          </p>
        </div>
        <Filter className="h-8 w-8 text-sage" aria-hidden="true" />
      </div>

      {!compact && (
        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              className={cn(
                "grid min-h-16 min-w-40 gap-1 rounded-lg border px-3 py-2 text-left transition",
                item === category
                  ? "border-sage bg-teal-50"
                  : "border-slate-200 bg-white hover:bg-slate-50",
              )}
              key={item}
              onClick={() => setCategory(item)}
              type="button"
            >
              <span className="text-xl font-black text-slate-950">
                {featureCounts[item]}
              </span>
              <span className="text-xs font-bold text-slate-600">{item}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(220px,1fr)_44px]">
        <label className="relative grid gap-2 text-sm font-bold text-slate-600">
          <span className="sr-only">Search this category</span>
          <Search
            className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-500"
            aria-hidden="true"
          />
          <input
            className="min-h-11 rounded-md border border-slate-300 px-10 text-slate-950 focus:border-sage focus:ring-4 focus:ring-teal-100"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${category}`}
          />
        </label>
        <a
          className="grid h-11 w-11 place-items-center rounded-md bg-slate-950 text-white transition hover:bg-slate-800"
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download="pc-comparer-feature-blueprint.csv"
          aria-label="Download blueprint CSV"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleFeatures.map((feature) => (
          <article
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            key={feature.id}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black uppercase tracking-wide text-ember">
                {feature.layer}
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-black",
                  feature.status === "ui-ready" && "bg-teal-50 text-teal-800",
                  feature.status === "api-ready" && "bg-blue-50 text-blue-800",
                  feature.status === "foundation" && "bg-slate-100 text-slate-600",
                )}
              >
                {feature.status}
              </span>
            </div>
            <h3 className="mt-3 text-base font-black text-slate-950">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm leading-5 text-slate-600">
              Feature ID: <code>{feature.id}</code>
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
