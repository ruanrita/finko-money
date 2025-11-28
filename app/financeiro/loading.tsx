import { AuthenticatedLayout } from "@/components/authenticated-layout";
import { FinanceiroSkeleton } from "@/components/skeletons/financeiro-skeleton";

export default function FinanceiroLoading() {
  return (
    <AuthenticatedLayout currentBranch={null as any}>
      <div className="relative overflow-hidden border-b-2 border-border bg-header-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
        <div className="relative px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 rounded bg-white/20 animate-pulse" />
              <div className="h-4 w-56 rounded bg-white/10 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 animate-pulse" />
              <div className="h-10 w-32 rounded bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <FinanceiroSkeleton />
    </AuthenticatedLayout>
  );
}
