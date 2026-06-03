import { BudgetHunter } from "@/components/BudgetHunter";
import { FeatureBlueprint } from "@/components/FeatureBlueprint";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function Home() {
  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Home"
        title="The Budget Hunter"
        description="The core conversational AI workflow for finding current PC and laptop deals inside a strict budget, powered by a server-side Gemini route with Google Search grounding."
      />
      <BudgetHunter />
      <FeatureBlueprint initialCategory="Advanced Hardware Filtering" compact />
    </div>
  );
}
