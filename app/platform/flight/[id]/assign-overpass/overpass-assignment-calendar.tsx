"use client";

import React, { useState, useEffect } from "react";
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
  Calendar,
  MapPin,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Satellite } from "react-sat-map";
import { RefreshButton } from "@/components/refresh-button";
import type { GroundStation } from "@/app/api/ground-stations/types";
import Protected, { useIsOperator } from "@/components/protected";
import { getOverpassWindows } from "@/app/api/overpass/overpass-service";
import { associateOverpass } from "@/app/api/flight/flight-plan-service";
import type { 
  Overpass as APIOverpass, 
  OverpassQueryParams 
} from "@/app/api/overpass/types";
import type { TimePeriod } from "@/app/platform/overpass-schedule/time-period-select";
import { getDateRangeFromPeriod } from "@/components/overpass/overpass-utils";
import {
  formatTime,
  getDuration,
  getPassQuality,
} from "@/components/overpass/overpass-utils";
import { OverpassList } from "@/components/overpass/overpass-list";

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
  const isOperator = useIsOperator();

  // Store stable IDs to avoid dependency issues
  const satelliteId = satellite.id || 1;
  const groundStationId = groundStation.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchOverpasses = async (): Promise<void> => {
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
  };

  useEffect(() => {
    console.log("[OverpassAssignmentCalendar] Component mounted/updated - fetching overpasses");
    fetchOverpasses();
    // Only depend on primitive values to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satelliteId, groundStationId, timePeriod]);

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
          {!isOperator && (
            <div className="mb-3 p-3 bg-muted/30 border border-muted rounded-md text-sm text-muted-foreground flex-shrink-0">
              <p>You need operator permissions to assign overpasses to flight plans.</p>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <OverpassList
              overpasses={overpasses}
              loading={loading}
              error={error}
              isMounted={isMounted}
              emptyMessage="No available overpass windows"
              emptyDescription={`No unassigned passes found for ${groundStation?.name} in the selected time period.`}
              onOverpassClick={isOperator ? handleSelectOverpass : undefined}
            />
          </div>
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
          </AlertDialogHeader>
          {selectedOverpass && (
            <div className="space-y-2">
              <p>
                Are you sure you want to assign this flight plan to the following overpass window?
              </p>
              <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                <div>
                  <span className="font-medium">Time:</span>{" "}
                  {formatTime(selectedOverpass.startTime, isMounted)} - {formatTime(selectedOverpass.endTime, isMounted)}
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
          <AlertDialogFooter>
            <AlertDialogCancel disabled={associating}>Cancel</AlertDialogCancel>
            <Protected requireOperator>
              <AlertDialogAction onClick={handleConfirmAssignment} disabled={associating}>
                {associating ? "Assigning..." : "Confirm Assignment"}
              </AlertDialogAction>
            </Protected>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
