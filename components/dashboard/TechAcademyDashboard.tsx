import { BookOpen, Cpu, Info, Wrench } from "lucide-react";

const glossary = [
  ["PCIe Gen 4", "A high-speed expansion and SSD interface generation."],
  ["NAND Flash", "The storage memory used inside SSDs and many embedded devices."],
  ["VRMs", "Voltage regulation modules that stabilize power delivery to CPUs and GPUs."],
  ["MUX Switch", "A laptop circuit that can route the dGPU directly to the display."],
];

export function TechAcademyDashboard() {
  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-ember">
              Interactive Glossary
            </p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">
              Hover-ready knowledge cards
            </h3>
          </div>
          <BookOpen className="h-7 w-7 text-sage" aria-hidden="true" />
        </div>
        <div className="mt-5 grid gap-3">
          {glossary.map(([term, definition]) => (
            <article
              className="group rounded-lg border border-slate-200 bg-slate-50 p-4"
              key={term}
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-black text-slate-950">{term}</h4>
                <Info className="h-4 w-4 text-slate-500" aria-hidden="true" />
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{definition}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel sm:p-6">
        <p className="text-xs font-black uppercase tracking-wide text-ember">
          Teardown Visualizer
        </p>
        <h3 className="mt-2 text-2xl font-black text-slate-950">
          Upgrade path map
        </h3>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            [Cpu, "CPU and socket", "BGA, AM5, LGA, and upgrade lifecycle context."],
            [Wrench, "Memory and storage", "Soldered, SODIMM, DIMM, M.2, and SATA paths."],
            [Info, "Cooling", "Fan, heat pipe, vapor chamber, and throttling explainers."],
            [BookOpen, "Optimization", "Post-purchase setup guides for OS, drivers, and debloat."],
          ].map(([Icon, title, body]) => (
            <article className="rounded-lg border border-slate-200 p-4" key={String(title)}>
              <Icon className="h-5 w-5 text-sage" aria-hidden="true" />
              <h4 className="mt-3 font-black text-slate-950">{String(title)}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{String(body)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
