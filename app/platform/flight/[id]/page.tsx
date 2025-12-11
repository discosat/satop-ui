"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle, XCircle, CalendarClock, Images } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getFlightPlanById,
  updateFlightPlan,
  getFlightPlanImages,
} from "@/app/api/flight/flight-plan-service";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import { getUsers } from "@/app/api/users/users-service";
import FlightPlanSteps from "@/app/platform/flight/components/flight-plan-steps";
import { Command, CameraSettings, CaptureLocation } from "../components/commands/command";
import { CommandBuilder } from "../components/commands/command-builder";
import { FlightPlan } from "@/app/api/flight/types";
import type { Satellite } from "@/app/api/satellites/types";
import type { GroundStation } from "@/app/api/ground-stations/types";
import type { User } from "@/app/api/users/types";
import { FlightPlanSkeleton } from "./flight-plan-skeleton";
import Protected from "@/components/protected";
import { ApproveDialog } from "../components/dialogs/approve-dialog";
import { RejectDialog } from "../components/dialogs/reject-dialog";
import { MetadataModal } from "../components/dialogs/metadata-modal";
import { MissionOverview } from "./mission-overview";

// We are going to make some key changes to the flight planning page.
// Creating a new flight plan is now going to take multiple steps.
// We should attempt to show some sort of step progress of how far along we are in the process(based on the status of the flight plan), preferably I would like this to be seen horizontally with a key highlight of the current step.
// First step is to create a new flight plan.  -- DRAFT
// Second step is to approve the flight plan.  -- APPROVED/REJECTED (if rejected its not able to be assigned to an overpass)
// Third step is to assign the flight plan to an overpass.  -- ASSIGNED_TO_OVERPASS
// Fourth step is to transmit the flight plan, this will happen automatically when its scheduled for execution -- TRANSMITTED

export default function FlightPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commands, setCommands] = useState<Command[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [groundStations, setGroundStations] = useState<GroundStation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [imageCount, setImageCount] = useState<number>(0);
  const [validationStates, setValidationStates] = useState<Record<string, boolean | null>>({});

  const id = typeof params.id === "string" ? params.id : "";

  // Check if any commands have invalid validation OR if any TRIGGER_CAPTURE commands are pending validation
  const hasInvalidCommands = useMemo(() => {
    return Object.values(validationStates).some(state => state === false);
  }, [validationStates]);

  // Check if all TRIGGER_CAPTURE commands have been validated successfully
  const allCommandsValid = useMemo(() => {
    // Get all TRIGGER_CAPTURE command IDs
    const triggerCaptureIds = commands
      .filter(cmd => cmd.type === "TRIGGER_CAPTURE")
      .map(cmd => cmd.id);
    
    // If no TRIGGER_CAPTURE commands, we're valid
    if (triggerCaptureIds.length === 0) {
      return true;
    }
    
    // All TRIGGER_CAPTURE commands must have validation state === true
    return triggerCaptureIds.every(id => validationStates[id] === true);
  }, [commands, validationStates]);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [plan, sats, stations, usersList] = await Promise.all([
          getFlightPlanById(Number(id)),
          getSatellites(),
          getGroundStations(),
          getUsers(),
        ]);

        if (!isCancelled) {
          setFlightPlan(plan);
          setSatellites(sats);
          setGroundStations(stations);
          setUsers(usersList);
          
          // Fetch images if plan is TRANSMITTED
          if (plan?.status === "TRANSMITTED") {
            const images = await getFlightPlanImages(Number(id));
            setImageCount(images.length);
          } else {
            setImageCount(0);
          }
          
          // Parse commands from flight plan
          if (plan?.commands && Array.isArray(plan.commands)) {
            try {
              // Convert API commands to UI Command format with IDs
              const commandsWithIds: Command[] = [];
              for (const apiCmd of plan.commands) {
                const cmd = apiCmd as Record<string, unknown>;
                if (cmd.commandType === "TRIGGER_CAPTURE") {
                  commandsWithIds.push({
                    type: "TRIGGER_CAPTURE",
                    id: crypto.randomUUID(),
                    captureLocation: (cmd.captureLocation as CaptureLocation) || { latitude: 0, longitude: 0 },
                    cameraSettings: (cmd.cameraSettings as CameraSettings) || {
                      cameraId: "",
                      type: 0,
                      exposureMicroseconds: 0,
                      iso: 1,
                      numImages: 1,
                      intervalMicroseconds: 0,
                      observationId: 1,
                      pipelineId: 1,
                    },
                  });
                } else if (cmd.commandType === "TRIGGER_PIPELINE") {
                  commandsWithIds.push({
                    type: "TRIGGER_PIPELINE",
                    id: crypto.randomUUID(),
                    executionTime: (cmd.executionTime as string) || new Date().toISOString(),
                    mode: (cmd.mode as number) || 0,
                  });
                }
              }
              setCommands(commandsWithIds);
            } catch (error) {
              console.error("Failed to parse flight plan commands:", error);
              setCommands([]);
            }
          } else {
            setCommands([]);
          }
        }
      } catch (error) {
        console.error("Failed to load flight plan", error);
        if (!isCancelled) {
          setFlightPlan(null);
          setCommands([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    router.push("/platform/flight");
  };

  const handleSave = async () => {
    if (!flightPlan || !hasChanges) return;
    setIsLoading(true);
    try {
      // Convert UI commands to API format
      const commandBody = commands.map((cmd) => {
        if (cmd.type === "TRIGGER_CAPTURE") {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...commandData } = cmd;
          return {
            commandType: cmd.type,
            captureLocation: commandData.captureLocation,
            cameraSettings: commandData.cameraSettings,
          };
        } else {
          // TRIGGER_PIPELINE
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...commandData } = cmd;
          return {
            commandType: cmd.type,
            executionTime: commandData.executionTime,
            mode: commandData.mode,
          };
        }
      });

      const updatedFlightPlanPayload: FlightPlan = {
        ...flightPlan,
        commands: commandBody,
      };

      const newVersion = await updateFlightPlan(updatedFlightPlanPayload);

      if (newVersion?.id) {
        toast.success("New flight plan version created successfully!");
        router.push(`/platform/flight/${newVersion.id}`);
      } else {
        throw new Error(
          "Failed to create new version. API did not return a new flight plan."
        );
      }
    } catch (err) {
      console.error("Failed to save flight plan:", err);
      const message =
        err instanceof Error ? err.message : "Failed to save flight plan";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommandsChange = (newCommands: Command[]) => {
    setCommands(newCommands);
    setHasChanges(true);
  };

  const handleApprovalSuccess = () => {
    if (!flightPlan) return;
    setFlightPlan({ ...flightPlan, status: "APPROVED" });
  };

  const handleRejectionSuccess = () => {
    if (!flightPlan) return;
    setFlightPlan({ ...flightPlan, status: "REJECTED" });
    setTimeout(() => router.back(), 1500);
  };

  if (isLoading && !flightPlan) {
    return <FlightPlanSkeleton />;
  }

  if (!flightPlan) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-muted-foreground">Flight plan not found</p>
        </div>
      </div>
    );
  }

  // Flight plan editing is now always allowed, creating new versions when saved

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBack} className="w-fit -ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {flightPlan.name || "Command Sequence"}
          </h1>

        <div className="flex gap-2">
          {/* Hide unsaved changes indicator when in TRANSMITTED state */}
          {hasChanges && flightPlan.status !== "TRANSMITTED" && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Unsaved changes
            </div>
          )}
          
          {/* Show View Images button when status is TRANSMITTED */}
          {flightPlan.status === "TRANSMITTED" && (
            <Button
              variant="default"
              onClick={() => router.push(`/platform/flight/${id}/images`)}
            >
              <Images className="mr-2 h-4 w-4" />
              View Images
            </Button>
          )}

          {/* Show Assign to Overpass button when status is APPROVED or FAILED */}
          {(flightPlan.status === "APPROVED" || flightPlan.status === "FAILED") && (
            <Protected requireOperator>
              <Button
                variant="default"
                onClick={() => router.push(`/platform/flight/${id}/assign-overpass`)}
                disabled={isLoading}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                {flightPlan.status === "FAILED" ? "Retry Transmission" : "Assign to Overpass"}
              </Button>
            </Protected>
          )}

          {/* Hide approve/reject buttons when in TRANSMITTED or ASSIGNED_TO_OVERPASS state */}
          {flightPlan.status !== "TRANSMITTED"  && (
            <Protected requireOperator>
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={flightPlan.status === "REJECTED" || isLoading || hasChanges}
                  title={hasChanges ? "Save changes before rejecting" : flightPlan.status === "REJECTED" ? "Already rejected" : ""}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                {flightPlan.status !== "ASSIGNED_TO_OVERPASS" && (
                <Button
                  variant="outline"
                  onClick={() => setShowApproveDialog(true)}
                  disabled={flightPlan.status === "APPROVED" || isLoading || hasChanges}
                  title={hasChanges ? "Save changes before approving" : flightPlan.status === "APPROVED" ? "Already approved" : ""}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                )}
              </>
            </Protected>
          )}

          <Protected requireOperator>
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges || !allCommandsValid}
              variant={hasChanges ? "default" : "outline"}
              title={
                !allCommandsValid
                  ? "All imaging coordinates must be validated before saving"
                  : !hasChanges
                    ? "No changes to save"
                    : "Save changes as a new version"
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {hasChanges ? "Save as New Version" : "No Changes"}
            </Button>
          </Protected>
          </div>
        </div>
      </div>

      <FlightPlanSteps status={flightPlan.status} hasImages={imageCount > 0} />
      
          <MissionOverview
            flightPlan={flightPlan}
            satellites={satellites}
            groundStations={groundStations}
            users={users}
            onViewMetadata={() => setShowMetadataModal(true)}
          />

      <Card>
        <CardHeader>
          <CardTitle>Commands</CardTitle>
          <CardDescription>
            Edit the command sequence for this flight plan. Changes will create a new version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Protected
            requireOperator
            fallback={
              <CommandBuilder
                commands={commands}
                onCommandsChange={handleCommandsChange}
                isReadOnly={true}
                satelliteId={flightPlan?.satId}
                validationStates={validationStates}
                onValidationStatesChange={setValidationStates}
              />
            }
          >
            <CommandBuilder
              commands={commands}
              onCommandsChange={handleCommandsChange}
              isReadOnly={false}
              satelliteId={flightPlan?.satId}
              validationStates={validationStates}
              onValidationStatesChange={setValidationStates}
            />
          </Protected>
          
          {/* Validation status messages */}
          {hasChanges && hasInvalidCommands && (
            <div className="text-sm text-destructive text-center mt-4 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              ⚠️ Some commands have invalid imaging coordinates. Please fix them before saving.
            </div>
          )}
          {hasChanges && !allCommandsValid && !hasInvalidCommands && (
            <div className="text-sm text-muted-foreground text-center mt-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              ⏳ Validating imaging coordinates...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ApproveDialog
        open={showApproveDialog}
        onOpenChange={setShowApproveDialog}
        flightPlanId={flightPlan.id}
        onApprovalSuccess={handleApprovalSuccess}
      />

      <RejectDialog
        open={showRejectDialog}
        onOpenChange={setShowRejectDialog}
        flightPlanId={flightPlan.id}
        flightPlanName={flightPlan.name}
        onRejectionSuccess={handleRejectionSuccess}
      />

      <MetadataModal
        open={showMetadataModal}
        onOpenChange={setShowMetadataModal}
        flightPlan={flightPlan}
        satellites={satellites}
        groundStations={groundStations}
        users={users}
      />
    </div>
  );
}
