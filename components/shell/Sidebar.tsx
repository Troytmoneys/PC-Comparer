"use client";

import {
  BookOpen,
  Car,
  ChartSpline,
  Cpu,
  Gauge,
  Search,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { totalFeatureCount } from "@/data/features";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "The Budget Hunter",
    description: "Live deal search",
    icon: Search,
  },
  {
    href: "/versus",
    label: "Versus Matrix",
    description: "Laptop vs PC",
    icon: Cpu,
  },
  {
    href: "/market-trends",
    label: "Market Trends",
    description: "Price intelligence",
    icon: ChartSpline,
  },
  {
    href: "/tech-academy",
    label: "Tech Academy",
    description: "Glossary and guides",
    icon: BookOpen,
  },
  {
    href: "/my-garage",
    label: "My Garage",
    description: "Saved builds",
    icon: Car,
  },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-4 lg:p-5">
        <Link
          href="/"
          className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-panel"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-sage">
              <Gauge className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-white/70">
                PC Comparer
              </p>
              <h1 className="text-xl font-black tracking-normal">
                Grounded AI
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-white/72">
            Deal hunting, spec comparison, market timing, and saved build
            intelligence for PCs and laptops.
          </p>
        </Link>

        <nav className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-lg border px-3 py-3 transition",
                  active
                    ? "border-sage bg-teal-50 text-slate-950"
                    : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-md",
                    active ? "bg-sage text-white" : "bg-slate-100 text-slate-500",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {item.description}
                  </span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-4xl font-black tracking-normal text-slate-950">
            {totalFeatureCount}
          </p>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            feature architecture mapped across hardware, performance, OS,
            account, education, pricing, and power-user systems.
          </p>
        </div>
      </div>
    </aside>
  );
}
