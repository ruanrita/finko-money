import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { OrcamentosSkeleton } from "@/components/skeletons/orcamentos-skeleton";

export default function OrcamentosLoading() {
  return (
    <AuthenticatedLayout currentBranch={null as any}>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-8 w-40 rounded bg-white/20 animate-pulse" />
              <div className="h-4 w-52 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 animate-pulse" />
              <div className="h-10 w-32 rounded bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <OrcamentosSkeleton />
    </AuthenticatedLayout>
  );
}
