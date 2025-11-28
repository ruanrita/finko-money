import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OrcamentosSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
      {/* Month selector and copy button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <Skeleton className="h-10 w-full sm:w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-10 rounded" />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-2 border-gray-300 dark:border-gray-700">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Budgets List */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-2 border-gray-300 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-3 w-full mb-2" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
