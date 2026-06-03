import { ArrowDownRight, ChartSpline, CircleDollarSign, Tags } from "lucide-react";

const pricePoints = [72, 66, 61, 64, 59, 54, 52, 48, 51, 46, 43, 39];

export function MarketTrendsDashboard() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-ember">
              Historical Pricing
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">
              GPU laptop deal index
            </h3>
          </div>
          <ChartSpline className="h-7 w-7 text-sage" aria-hidden="true" />
        </div>
        <div className="mt-8 flex h-48 items-end gap-2 border-b border-l border-slate-200 px-3">
          {pricePoints.map((height, index) => (
            <div
              className="flex flex-1 items-end"
              key={`${height}-${index}`}
              aria-label={`Month ${index + 1} value ${height}`}
            >
              <div
                className="w-full rounded-t bg-sage"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["Wait or Buy", "AI timing recommendation"],
            ["Depreciation", "12-month resale estimate"],
            ["Refurb Delta", "New vs refurbished spread"],
          ].map(([title, body]) => (
            <div className="rounded-lg bg-slate-50 p-4" key={title}>
              <h4 className="font-black text-slate-950">{title}</h4>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <MetricCard
          icon={<CircleDollarSign className="h-5 w-5" />}
          title="Coupon scanner"
          value="API-ready"
          body="Retailer offers store coupon codes and verified timestamps."
        />
        <MetricCard
          icon={<ArrowDownRight className="h-5 w-5" />}
          title="Depreciation estimator"
          value="Foundation"
          body="Price snapshots support resale and wait-or-buy calculations."
        />
        <MetricCard
          icon={<Tags className="h-5 w-5" />}
          title="Refurb value model"
          value="Foundation"
          body="Offer condition and warranty fields support new/open-box/refurb math."
        />
      </div>
    </section>
  );
}

function MetricCard({
  icon,
  title,
  value,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-center justify-between gap-4">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-teal-50 text-sage">
          {icon}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
          {value}
        </span>
      </div>
      <h3 className="mt-4 font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
    </article>
  );
}
