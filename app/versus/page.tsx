import { ComparisonEngine } from "@/components/ComparisonEngine";
import { FeatureBlueprint } from "@/components/FeatureBlueprint";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function VersusPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Tab 2"
        title="Versus Matrix"
        description="A side-by-side comparison engine for laptops, desktops, mini PCs, and workstations, including external display limits, OS flexibility, upgrade paths, and sustained performance."
      />
      <ComparisonEngine />
      <FeatureBlueprint initialCategory="Performance Benchmarking" compact />
    </div>
  );
}
