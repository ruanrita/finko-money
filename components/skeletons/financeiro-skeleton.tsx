import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FinanceiroSkeleton() {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="space-y-4 sm:space-y-6">
        {/* Filters */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:flex md:flex-wrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full md:w-40" />
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          <Card className="border-2 border-gray-300 dark:border-gray-700">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-300 dark:border-gray-700">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded-full mx-auto" />
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="border-2 border-gray-300 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
