"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Satellite } from "react-sat-map";
import { RefreshButton } from "@/components/refresh-button";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { getOverpassWindows } from "@/app/api/overpass/overpass-service";
import { associateOverpass } from "@/app/api/flight/flight-plan-service";
import type { 
  Overpass as APIOverpass, 
  OverpassQueryParams 
} from "@/app/api/overpass/types";
import type { TimePeriod } from "@/app/platform/satellite-overpass/time-period-select";

interface SatelliteWithId extends Satellite {
  id?: number;
}

interface OverpassAssignmentCalendarProps {
  satellite: SatelliteWithId;
  groundStation: GroundStation;
  timePeriod?: TimePeriod;
  flightPlanId: number;
  onAssignmentComplete: () => void;
}

export function OverpassAssignmentCalendar({
  satellite,
  groundStation,
  timePeriod = "next-3-days",
  flightPlanId,
  onAssignmentComplete,
}: OverpassAssignmentCalendarProps) {
  const [overpasses, setOverpasses] = useState<APIOverpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [selectedOverpass, setSelectedOverpass] = useState<APIOverpass | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [associating, setAssociating] = useState<boolean>(false);

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
    console.log("[OverpassAssignmentCalendar] fetchOverpasses called");
    
    if (!satellite || !groundStation) {
      console.warn("[OverpassAssignmentCalendar] Missing satellite or ground station:", {
        hasSatellite: !!satellite,
        hasGroundStation: !!groundStation,
      });
      setOverpasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const satelliteId = satellite.id || 1;
      const dateRange = getDateRangeFromPeriod(timePeriod);

      console.log("[OverpassAssignmentCalendar] Fetching overpasses with params:", {
        satelliteId,
        satelliteName: satellite.name,
        groundStationId: groundStation.id,
        groundStationName: groundStation.name,
        startTime: dateRange.start.toISOString(),
        endTime: dateRange.end.toISOString(),
        timePeriod,
      });

      const queryParams: OverpassQueryParams = {
        startTime: dateRange.start.toISOString(),
        endTime: dateRange.end.toISOString(),
        minimumElevation: 5,
        maxResults: 50,
        minimumDuration: 60,
      };

      const data = await getOverpassWindows(
        satelliteId,
        groundStation.id,
        queryParams
      );

      console.log("[OverpassAssignmentCalendar] Received overpasses from API:", {
        totalCount: data.length,
        overpasses: data,
      });

      // Filter out already assigned overpasses
      const unassignedOverpasses = data.filter(op => {
        const isAssigned = !!op.associatedFlightPlan?.id;
        if (isAssigned) {
          console.log("[OverpassAssignmentCalendar] Filtering out assigned overpass:", {
            startTime: op.startTime,
            endTime: op.endTime,
            associatedFlightPlanId: op.associatedFlightPlan?.id,
            associatedFlightPlanName: op.associatedFlightPlan?.name,
          });
        }
        return !isAssigned;
      });

      console.log("[OverpassAssignmentCalendar] Filtered unassigned overpasses:", {
        totalReceived: data.length,
        assignedCount: data.length - unassignedOverpasses.length,
        unassignedCount: unassignedOverpasses.length,
        unassignedOverpasses,
      });

      setOverpasses(unassignedOverpasses);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("[OverpassAssignmentCalendar] Error fetching overpasses:", {
        error: err,
        errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [satellite, groundStation, timePeriod]);

  useEffect(() => {
    console.log("[OverpassAssignmentCalendar] Component mounted/updated");
    setIsMounted(true);
    fetchOverpasses();
  }, [fetchOverpasses]);

  const handleSelectOverpass = (overpass: APIOverpass) => {
    console.log("[OverpassAssignmentCalendar] Overpass selected:", {
      startTime: overpass.startTime,
      endTime: overpass.endTime,
      maxElevation: overpass.maxElevation,
      satelliteId: overpass.satelliteId,
      groundStationId: overpass.groundStationId,
    });
    setSelectedOverpass(overpass);
    setShowConfirmDialog(true);
  };

  const handleConfirmAssignment = async () => {
    if (!selectedOverpass) {
      console.warn("[OverpassAssignmentCalendar] No overpass selected for assignment");
      return;
    }
    
    console.log("[OverpassAssignmentCalendar] Confirming assignment:", {
      flightPlanId,
      overpassStartTime: selectedOverpass.startTime,
      overpassEndTime: selectedOverpass.endTime,
    });

    setAssociating(true);
    try {
      const result = await associateOverpass(flightPlanId, {
        startTime: selectedOverpass.startTime,
        endTime: selectedOverpass.endTime,
      });
      
      console.log("[OverpassAssignmentCalendar] Assignment successful:", result);
      toast.success("Overpass assigned successfully!");
      setShowConfirmDialog(false);
      
      // Delay navigation slightly for user feedback
      setTimeout(() => {
        console.log("[OverpassAssignmentCalendar] Navigating back after successful assignment");
        onAssignmentComplete();
      }, 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to assign overpass";
      console.error("[OverpassAssignmentCalendar] Assignment failed:", {
        error: err,
        errorMessage: msg,
        stack: err instanceof Error ? err.stack : undefined,
      });
      toast.error("Assignment failed", { description: msg });
    } finally {
      setAssociating(false);
    }
  };

  // Format time only
  const formatTime = (dateString: string): string => {
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
      const dateKey = date.toDateString();

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

  const renderContent = () => {
    console.log("[OverpassAssignmentCalendar] renderContent called:", {
      loading,
      error,
      overpassesCount: overpasses.length,
      isMounted,
    });

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
      console.error("[OverpassAssignmentCalendar] Displaying error state:", error);
      return (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
          <p>Error: {error}</p>
        </div>
      );
    }

    if (overpasses.length === 0) {
      console.warn("[OverpassAssignmentCalendar] No overpasses available to display");
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
                  No available overpass windows
                </h3>
                <p className="text-xs text-muted-foreground/80 max-w-xs">
                  No unassigned passes found for{" "}
                  <span className="font-medium">
                    {groundStation?.name}
                  </span>{" "}
                  in the selected time period.
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

    console.log("[OverpassAssignmentCalendar] Rendering overpass list:", {
      count: overpasses.length,
    });

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
                    const globalIndex = overpasses.findIndex(p => p === pass);

                    return (
                      <Card
                        key={`${dateKey}-${passIndex}`}
                        className={`transition-all hover:shadow-md cursor-pointer hover:border-primary/50 ${
                          isNow ? "ring-2 ring-primary ring-offset-2" : ""
                        }`}
                        onClick={() => handleSelectOverpass(pass)}
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
    <>
      <Card className="w-full h-full shadow-md flex flex-col">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Available Overpass Windows
              </CardTitle>
              <CardDescription>
                Click on a pass to assign it to your flight plan
              </CardDescription>
            </div>
            <RefreshButton onClick={fetchOverpasses} />
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
          <div className="flex-1 min-h-0">{renderContent()}</div>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-muted-foreground flex-shrink-0">
          <p>Only showing unassigned overpass windows • Minimum elevation: 5°</p>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Overpass Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedOverpass && (
                <div className="space-y-2 mt-2">
                  <p>
                    Are you sure you want to assign this flight plan to the following overpass window?
                  </p>
                  <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Time:</span>{" "}
                      {formatTime(selectedOverpass.startTime)} - {formatTime(selectedOverpass.endTime)}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span>{" "}
                      {getDuration(selectedOverpass.startTime, selectedOverpass.endTime)} minutes
                    </div>
                    <div>
                      <span className="font-medium">Max Elevation:</span>{" "}
                      {selectedOverpass.maxElevation.toFixed(1)}°
                    </div>
                    <div>
                      <span className="font-medium">Quality:</span>{" "}
                      {getPassQuality(selectedOverpass.maxElevation).quality}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will update the flight plan status to ASSIGNED_TO_OVERPASS and schedule it for execution during this window.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={associating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAssignment} disabled={associating}>
              {associating ? "Assigning..." : "Confirm Assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
