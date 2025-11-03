"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Satellite as SatelliteIcon, Eye, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { OverpassCard } from "./overpass-card";
import { groupOverpassesByDate, formatDateHeader } from "./overpass-utils";
import type { Overpass } from "@/app/api/overpass/types";

interface OverpassListProps {
  overpasses: Overpass[];
  loading: boolean;
  error: string | null;
  isMounted: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onOverpassClick?: (overpass: Overpass) => void;
  renderOverpassActions?: (overpass: Overpass) => React.ReactNode;
}

export function OverpassList({
  overpasses,
  loading,
  error,
  isMounted,
  emptyMessage = "No overpass windows",
  emptyDescription = "No passes found in the selected time period.",
  onOverpassClick,
  renderOverpassActions,
}: OverpassListProps) {
  if (loading) {
    return (
      <div className="space-y-4 p-1">
        <Skeleton className="w-full h-28 rounded-md" />
        <Skeleton className="w-full h-28 rounded-md" />
        <Skeleton className="w-full h-28 rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (overpasses.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <SatelliteIcon className="h-12 w-12 text-muted-foreground/40" />
              <Eye className="h-4 w-4 absolute -bottom-1 -right-1 text-muted-foreground/60 bg-background rounded-full p-0.5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-muted-foreground">
                {emptyMessage}
              </h3>
              <p className="text-xs text-muted-foreground/80 max-w-xs">
                {emptyDescription}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-full">
              <Info className="h-3 w-3" />
              <span>Try selecting a different time period</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isMounted) {
    return (
      <div className="space-y-4 p-1">
        <Skeleton className="w-full h-28 rounded-md" />
        <Skeleton className="w-full h-28 rounded-md" />
        <Skeleton className="w-full h-28 rounded-md" />
      </div>
    );
  }

  const groupedPasses = groupOverpassesByDate(overpasses);
  const sortedDates = Object.keys(groupedPasses).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-4 p-1">
        {sortedDates.map((dateKey) => (
          <div key={dateKey} className="space-y-3">
            {/* Date Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b pb-2 mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDateHeader(dateKey, isMounted)}
              </h3>
            </div>

            {/* Passes for this date */}
            <div className="space-y-3">
              {groupedPasses[dateKey].map((pass, passIndex) => {
                const globalIndex = overpasses.findIndex((p) => p === pass);

                return (
                  <OverpassCard
                    key={`${dateKey}-${passIndex}`}
                    overpass={pass}
                    passNumber={globalIndex + 1}
                    isMounted={isMounted}
                    onClick={onOverpassClick ? () => onOverpassClick(pass) : undefined}
                    rightContent={renderOverpassActions?.(pass)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
