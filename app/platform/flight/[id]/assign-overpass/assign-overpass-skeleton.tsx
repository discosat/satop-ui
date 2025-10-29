import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AssignOverpassSkeleton() {
  return (
    <div className="flex flex-col p-6 gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Skeleton className="h-10 w-32" /> {/* Back button */}

        <div className="space-y-2">
          <Skeleton className="h-10 w-48" /> {/* Title */}
          <Skeleton className="h-5 w-96" /> {/* Description */}
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

        {/* Flight Plan Details Card */}
        <Card className="border-2">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-48 mb-2" /> {/* Title */}
            <Skeleton className="h-4 w-96" /> {/* Description */}
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" /> {/* Label */}
                  <Skeleton className="h-5 w-32" /> {/* Value */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-1 flex-shrink-0">
          <Skeleton className="h-6 w-64 mb-2" /> {/* Title */}
          <Skeleton className="h-4 w-full" /> {/* Description */}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
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
