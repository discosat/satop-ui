"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Clock,
  Calendar,
  MapPin,
  ArrowUpRight,
  Satellite as SatelliteIcon,
  Info,
  Eye,
  CheckCircle2,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Satellite } from "react-sat-map";
import { RefreshButton } from "@/components/refresh-button";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import {
  getOverpassWindows,
  type Overpass as APIOverpass,
  type OverpassQueryParams,
} from "@/app/api/platform/overpass/overpass-service";
import type { TimePeriod } from "./time-period-select";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Extended satellite interface that includes the original API ID
interface SatelliteWithId extends Satellite {
  id?: number;
}

interface OverpassCalendarProps {
  satellites: SatelliteWithId[];
  groundStation?: GroundStation | null;
  timePeriod?: TimePeriod;
}

export function OverpassCalendar({
  satellites,
  groundStation,
  timePeriod = "next-3-days",
}: OverpassCalendarProps) {
  const [overpasses, setOverpasses] = useState<APIOverpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Get the selected satellite (first one if multiple)
  const selectedSatellite = satellites?.[0];

  // Convert time period to date range
  const getDateRangeFromPeriod = (
    period: TimePeriod
  ): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(start);

    switch (period) {
      case "today":
        end.setDate(start.getDate() + 1);
        break;
      case "tomorrow":
        start.setDate(start.getDate() + 1);
        end.setDate(start.getDate() + 1);
        break;
      case "next-3-days":
        end.setDate(start.getDate() + 3);
        break;
      case "next-week":
        end.setDate(start.getDate() + 7);
        break;
      case "next-2-weeks":
        end.setDate(start.getDate() + 14);
        break;
      case "next-month":
        end.setMonth(start.getMonth() + 1);
        break;
    }

    return { start, end };
  };

  const fetchOverpasses = useCallback(async (): Promise<void> => {
    if (!selectedSatellite || !groundStation) {
      setOverpasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the satellite ID from the satellite data or use a default mapping
      const satelliteId =
        selectedSatellite.id ||
        (selectedSatellite.name.includes("ISS") ? 1 : 1);

      const dateRange = getDateRangeFromPeriod(timePeriod);

      const queryParams: OverpassQueryParams = {
        startTime: dateRange.start.toISOString(),
        endTime: dateRange.end.toISOString(),
        minimumElevation: 5, // Minimum 5 degrees elevation
        maxResults: 50,
        minimumDuration: 60, // Minimum 1 minute duration
      };

      const data = await getOverpassWindows(
        satelliteId,
        groundStation.id,
        queryParams
      );

      setOverpasses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [selectedSatellite, groundStation, timePeriod]);

  useEffect(() => {
    setIsMounted(true);
    fetchOverpasses();
  }, [fetchOverpasses]);

  // Format time only - fixed to prevent hydration mismatch
  const formatTime = (dateString: string): string => {
    // Skip formatting during server render
    if (!isMounted) return "";

    const date = new Date(dateString);
    return date.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Calculate duration in minutes
  const getDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / (60 * 1000));
  };

  // Check if overpass is happening now
  const isHappeningNow = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  // Determine pass quality based on elevation
  const getPassQuality = (
    elevation: number
  ): {
    quality: string;
    variant: "default" | "secondary" | "outline";
    color: string;
  } => {
    if (elevation >= 60)
      return {
        quality: "Excellent",
        variant: "default",
        color: "text-green-700 bg-green-100 border-green-200",
      };
    if (elevation >= 40)
      return {
        quality: "Great",
        variant: "default",
        color: "text-blue-700 bg-blue-100 border-blue-200",
      };
    if (elevation >= 25)
      return {
        quality: "Good",
        variant: "secondary",
        color: "text-orange-700 bg-orange-100 border-orange-200",
      };
    if (elevation >= 15)
      return {
        quality: "Fair",
        variant: "outline",
        color: "text-yellow-700 bg-yellow-100 border-yellow-200",
      };
    return {
      quality: "Poor",
      variant: "outline",
      color: "text-red-700 bg-red-100 border-red-200",
    };
  };

  // Group overpasses by date
  const groupOverpassesByDate = (passes: APIOverpass[]) => {
    const groups: { [key: string]: APIOverpass[] } = {};

    passes.forEach((pass) => {
      const date = new Date(pass.startTime);
      const dateKey = date.toDateString(); // e.g., "Mon Sep 25 2025"

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(pass);
    });

    return groups;
  };

  // Format date for display
  const formatDateHeader = (dateString: string): string => {
    if (!isMounted) return "";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("da-DK", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  console.log("Overpasses:", overpasses);

  const renderContent = () => {
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
                  No visible passes found
                </h3>
                <p className="text-xs text-muted-foreground/80 max-w-xs">
                  The ISS won&apos;t be visible from{" "}
                  <span className="font-medium">
                    {groundStation?.name || "Aarhus"}
                  </span>{" "}
                  in the next 24 hours above 5° elevation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-full">
                <Info className="h-3 w-3" />
                <span>Try checking again later</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Don't render actual content until client-side hydration is complete
    if (!isMounted) {
      return (
        <div className="space-y-4 p-1">
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="w-full h-28 rounded-md" />
        </div>
      );
    }

    return (
      <ScrollArea className="h-full w-full">
        <div className="space-y-4 p-1">
          {(() => {
            const groupedPasses = groupOverpassesByDate(overpasses);
            const sortedDates = Object.keys(groupedPasses).sort(
              (a, b) => new Date(a).getTime() - new Date(b).getTime()
            );

            return sortedDates.map((dateKey) => (
              <div key={dateKey} className="space-y-3">
                {/* Date Header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b pb-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateHeader(dateKey)}
                  </h3>
                </div>

                {/* Passes for this date */}
                <div className="space-y-3">
                  {groupedPasses[dateKey].map((pass, passIndex) => {
                    const isNow = isHappeningNow(pass.startTime, pass.endTime);
                    const passQuality = getPassQuality(pass.maxElevation);
                    const duration = getDuration(pass.startTime, pass.endTime);
                    // Calculate global pass index
                    const globalIndex = overpasses.findIndex((p) => p === pass);

                    return (
                      <Card
                        key={`${dateKey}-${passIndex}`}
                        className={`transition-all hover:shadow-md ${
                          isNow ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            {/* Left side - Time window */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                {isNow && (
                                  <ArrowUpRight className="h-4 w-4 text-primary" />
                                )}
                                <div className="text-sm font-medium">
                                  Pass #{globalIndex + 1}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="font-mono">
                                    {formatTime(pass.startTime)} -{" "}
                                    {formatTime(pass.endTime)}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  ({duration} min)
                                </div>
                              </div>
                            </div>

                            {/* Right side - Elevation and quality */}
                            <div className="flex items-center gap-3">
                              {pass.associatedFlightPlan?.id && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link
                                        href={`/platform/flight/${pass.associatedFlightPlan.id}`}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          Assigned
                                        </span>
                                      </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <div className="text-xs">
                                        View flight plan
                                        {pass.associatedFlightPlan.name
                                          ? `: ${pass.associatedFlightPlan.name}`
                                          : ""}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}

                              <div className="text-right">
                                <div className="text-sm font-medium">
                                  {pass.maxElevation.toFixed(1)}° max
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  at {formatTime(pass.maxElevationTime)}
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`${passQuality.color} border font-medium`}
                              >
                                {passQuality.quality}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className="w-full h-full shadow-md flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {selectedSatellite?.name || "Satellite"} Overpasses
            </CardTitle>
            <CardDescription>
              {timePeriod === "today"
                ? "Today"
                : timePeriod === "tomorrow"
                ? "Tomorrow"
                : timePeriod === "next-3-days"
                ? "Next 3 days"
                : timePeriod === "next-week"
                ? "Next week"
                : timePeriod === "next-2-weeks"
                ? "Next 2 weeks"
                : "Next month"}
            </CardDescription>
          </div>
          <RefreshButton
            onClick={() => {
              fetchOverpasses();
            }}
          />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 pt-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground flex-shrink-0">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {groundStation?.name || "No ground station selected"}
            {groundStation && (
              <>
                ({groundStation.location.latitude.toFixed(2)}°N,{" "}
                {groundStation.location.longitude.toFixed(2)}°E)
              </>
            )}
          </span>
        </div>
        <div className="flex-1 min-h-0">{renderContent()}</div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground flex-shrink-0">
        <p>Minimum elevation: 5° above horizon</p>
      </CardFooter>
    </Card>
  );
}
