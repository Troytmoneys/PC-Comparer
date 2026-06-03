import { FeatureBlueprint } from "@/components/FeatureBlueprint";
import { MarketTrendsDashboard } from "@/components/dashboard/MarketTrendsDashboard";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function MarketTrendsPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Tab 3"
        title="Market Trends"
        description="Foundational pricing analytics for historical price tracking, depreciation estimates, coupon intelligence, refurbished value math, and wait-or-buy recommendations."
      />
      <MarketTrendsDashboard />
      <FeatureBlueprint initialCategory="Pricing Analytics" compact />
    </div>
  );
}
