import { Bell, KeyRound, ListChecks, Star } from "lucide-react";

export function MyGarageDashboard() {
  return (
    <section className="grid gap-4 xl:grid-cols-4">
      {[
        [KeyRound, "OAuth login", "Provider accounts and encrypted tokens are modeled in schema.sql."],
        [Star, "Dream Build", "Save ideal laptops, desktops, and component plans."],
        [Bell, "Price alerts", "Email-ready target price tracking for machines and offers."],
        [ListChecks, "Quirk reports", "User reports capture Linux, display, dock, and upgrade findings."],
      ].map(([Icon, title, body]) => (
        <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel" key={String(title)}>
          <span className="grid h-10 w-10 place-items-center rounded-md bg-teal-50 text-sage">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-black text-slate-950">{String(title)}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{String(body)}</p>
        </article>
      ))}
    </section>
  );
}
