import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function FlightPlanSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" /> {/* Back button */}
        
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" /> {/* Title */}
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" /> {/* Button 1 */}
            <Skeleton className="h-10 w-40" /> {/* Button 2 */}
            <Skeleton className="h-10 w-40" /> {/* Button 3 */}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex gap-4 justify-between">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Mission Overview Card */}
      <Card className="border-2">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <Skeleton className="h-6 w-48" /> {/* Title */}
              <Skeleton className="h-4 w-72 mt-2" /> {/* Description */}
            </div>
            <Skeleton className="h-8 w-32" /> {/* Status badge */}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" /> {/* Label */}
                <Skeleton className="h-5 w-32" /> {/* Value */}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Commands Card */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" /> {/* Title */}
          <Skeleton className="h-4 w-96" /> {/* Description */}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
