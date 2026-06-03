import { FeatureBlueprint } from "@/components/FeatureBlueprint";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { TechAcademyDashboard } from "@/components/dashboard/TechAcademyDashboard";

export default function TechAcademyPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Tab 4"
        title="Tech Academy"
        description="Educational UI for hardware terms, upgrade literacy, setup guides, and teardown-style explainers that help buyers understand what they are comparing."
      />
      <TechAcademyDashboard />
      <FeatureBlueprint initialCategory="Educational UI" compact />
    </div>
  );
}
