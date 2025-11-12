"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RefreshButton } from "@/components/refresh-button";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { getOverpassWindows } from "@/app/api/overpass/overpass-service";
import type { 
  Overpass as APIOverpass, 
  OverpassQueryParams 
} from "@/app/api/overpass/types";
import type { TimePeriod } from "@/app/platform/overpass-schedule/time-period-select";
import { getDateRangeFromPeriod } from "@/components/overpass/overpass-utils";
import { OverpassList } from "@/components/overpass/overpass-list";

interface OverpassCalendarBaseProps {
  satelliteId: number;
  satelliteName: string;
  groundStation: GroundStation;
  timePeriod: TimePeriod;
  title?: string;
  description?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  renderActions?: (overpass: APIOverpass) => React.ReactNode;
  onOverpassClick?: (overpass: APIOverpass) => void;
  filterOverpasses?: (overpasses: APIOverpass[]) => APIOverpass[];
  headerActions?: React.ReactNode;
  footerContent?: React.ReactNode;
  onDataFetched?: (overpasses: APIOverpass[]) => void;
  filterPastOverpasses?: boolean;
}

export interface OverpassCalendarBaseHandle {
  refresh: () => Promise<void>;
}

export const OverpassCalendarBase = forwardRef<OverpassCalendarBaseHandle, OverpassCalendarBaseProps>((props, ref) => {
  const {
    satelliteId,
    satelliteName,
    groundStation,
    timePeriod,
    title,
    description,
    emptyMessage = "No overpass windows",
    emptyDescription,
    renderActions,
    onOverpassClick,
    filterOverpasses,
    headerActions,
    footerContent,
    onDataFetched,
    filterPastOverpasses = false,
  } = props;
  const [allOverpasses, setAllOverpasses] = useState<APIOverpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchOverpasses = async (): Promise<void> => {
    if (!groundStation) {
      setAllOverpasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dateRange = getDateRangeFromPeriod(timePeriod);

      const queryParams: OverpassQueryParams = {
        startTime: dateRange.start.toISOString(),
        endTime: dateRange.end.toISOString(),
        minimumElevation: 5,
        maxResults: 50,
        minimumDuration: 60,
      };

      let data = await getOverpassWindows(
        satelliteId,
        groundStation.id,
        queryParams
      );

      // Filter out past overpasses if requested
      if (filterPastOverpasses) {
        const now = new Date();
        data = data.filter(op => new Date(op.endTime) > now);
      }

      // Store unfiltered data
      setAllOverpasses(data);
      
      // Callback for external state updates with unfiltered data
      if (onDataFetched) {
        onDataFetched(data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverpasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satelliteId, groundStation.id, timePeriod, filterPastOverpasses]);

  // Apply filters to get the displayed overpasses
  const overpasses = React.useMemo(() => {
    if (filterOverpasses) {
      return filterOverpasses(allOverpasses);
    }
    return allOverpasses;
  }, [allOverpasses, filterOverpasses]);

  // Expose refresh method to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: fetchOverpasses,
  }));

  const defaultEmptyDescription = emptyDescription || 
    `No passes found for ${groundStation?.name} in the selected time period.`;

  return (
    <Card className="w-full h-full shadow-md flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {title || `${satelliteName} Overpasses`}
            </CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            <RefreshButton onClick={fetchOverpasses} />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 pt-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground flex-shrink-0">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {groundStation?.name}
            {groundStation && (
              <>
                {" "}({groundStation.location.latitude.toFixed(2)}°N,{" "}
                {groundStation.location.longitude.toFixed(2)}°E)
              </>
            )}
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <OverpassList
            overpasses={overpasses}
            loading={loading}
            error={error}
            isMounted={isMounted}
            emptyMessage={emptyMessage}
            emptyDescription={defaultEmptyDescription}
            onOverpassClick={onOverpassClick}
            renderOverpassActions={renderActions}
          />
        </div>
      </CardContent>
      {footerContent && (
        <>
          <Separator />
          <CardFooter className="pt-3 flex-shrink-0">
            {footerContent}
          </CardFooter>
        </>
      )}
    </Card>
  );
});

OverpassCalendarBase.displayName = "OverpassCalendarBase";
