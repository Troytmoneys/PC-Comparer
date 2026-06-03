import { FeatureBlueprint } from "@/components/FeatureBlueprint";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function FeaturesPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Architecture"
        title="285-Feature Blueprint"
        description="The complete typed feature registry for seeding product configuration, database records, API permissions, and UI modules."
      />
      <FeatureBlueprint />
    </div>
  );
}
