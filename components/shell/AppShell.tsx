import { Sidebar } from "@/components/shell/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-ink lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <Sidebar />
      <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
