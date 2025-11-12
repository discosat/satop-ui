"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Satellite } from "react-sat-map";
import type { GroundStation } from "@/app/api/ground-stations/types";
import Protected, { useIsOperator } from "@/components/protected";
import { associateOverpass } from "@/app/api/flight/flight-plan-service";
import type { 
  Overpass as APIOverpass, 
} from "@/app/api/overpass/types";
import type { TimePeriod } from "@/app/platform/overpass-schedule/time-period-select";
import {
  formatTime,
  getDuration,
  getPassQuality,
} from "@/components/overpass/overpass-utils";
import { OverpassCalendarBase } from "@/components/overpass/overpass-calendar-base";
import type { OverpassCalendarBaseHandle } from "@/components/overpass/overpass-calendar-base";

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
  const [selectedOverpass, setSelectedOverpass] = useState<APIOverpass | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [associating, setAssociating] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const isOperator = useIsOperator();
  const calendarRef = React.useRef<OverpassCalendarBaseHandle>(null);

  // Store stable IDs to avoid dependency issues
  const satelliteId = satellite.id || 1;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
      
      // Refresh the overpass list to remove the newly assigned overpass
      console.log("[OverpassAssignmentCalendar] Refreshing overpass list");
      await calendarRef.current?.refresh();
      
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

  // Filter function to only show unassigned overpasses
  const filterUnassignedOverpasses = (overpasses: APIOverpass[]) => {
    return overpasses.filter(op => {
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
  };

  return (
    <>
      <OverpassCalendarBase
        ref={calendarRef}
        satelliteId={satelliteId}
        satelliteName={satellite.name}
        groundStation={groundStation}
        timePeriod={timePeriod}
        title="Available Overpass Windows"
        description="Click on a pass to assign it to your flight plan"
        emptyMessage="No available overpass windows"
        emptyDescription={`No unassigned passes found for ${groundStation?.name} in the selected time period.`}
        onOverpassClick={isOperator ? handleSelectOverpass : undefined}
        filterOverpasses={filterUnassignedOverpasses}
        filterPastOverpasses={true}
        headerActions={
          !isOperator ? (
            <div className="p-2 bg-muted/30 border border-muted rounded-md text-xs text-muted-foreground max-w-xs">
              <p>You need operator permissions to assign overpasses to flight plans.</p>
            </div>
          ) : undefined
        }
        footerContent={
          <p className="text-xs text-muted-foreground">
            Only showing unassigned overpass windows • Minimum elevation: 5°
          </p>
        }
      />

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
