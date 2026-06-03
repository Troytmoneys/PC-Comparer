import { FeatureBlueprint } from "@/components/FeatureBlueprint";
import { MyGarageDashboard } from "@/components/dashboard/MyGarageDashboard";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function MyGaragePage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Tab 5"
        title="My Garage"
        description="The account, saved build, price-drop alert, comparison history, OAuth settings, and user-submitted hardware knowledge workspace."
      />
      <MyGarageDashboard />
      <FeatureBlueprint initialCategory="User Accounts & Tracking" compact />
    </div>
  );
}
