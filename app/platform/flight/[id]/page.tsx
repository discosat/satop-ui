"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle, XCircle,  Activity } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  getFlightPlanById,
  updateFlightPlan,
  approveFlightPlan,
} from "@/app/api/flight/flight-plan-service";
import Protected from "@/components/protected";
import FlightPlanSteps from "@/app/platform/flight/components/flight-plan-steps";
import { Command, CameraSettings, CaptureLocation } from "../components/commands/command";
import { CommandBuilder } from "../components/commands/command-builder";
import { FlightPlan } from "@/app/api/flight/types";

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


  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const plan = await getFlightPlanById(Number(id));
        if (!isCancelled) {
          setFlightPlan(plan);
          
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
                    maxOffNadirDegrees: (cmd.maxOffNadirDegrees as number) || 0,
                    maxSearchDurationHours: (cmd.maxSearchDurationHours as number) || 0,
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
    router.back();
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
            maxOffNadirDegrees: commandData.maxOffNadirDegrees,
            maxSearchDurationHours: commandData.maxSearchDurationHours,
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

  const handleApprove = async () => {
    if (!flightPlan) return;
    setIsLoading(true);
    try {
      const result = await approveFlightPlan(
        flightPlan.id,
        true
      );

      if (result.success) {
        setFlightPlan({ ...flightPlan, status: "APPROVED" });
        setShowApproveDialog(false);
        toast.success(result.message);
        setTimeout(() => router.back(), 1500);
      } else {
        throw new Error(result.message || "Failed to approve flight plan");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Approval failed";
      toast.error(message);
      setShowApproveDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!flightPlan) return;
    setIsLoading(true);
    try {
      const result = await approveFlightPlan(
        flightPlan.id,
        false
      );

      if (result.success) {
        setFlightPlan({ ...flightPlan, status: "REJECTED" });
        setShowRejectDialog(false);
        toast.success(result.message);
        setTimeout(() => router.back(), 1500);
      } else {
        throw new Error(result.message || "Failed to reject flight plan");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rejection failed";
      toast.error(message);
      setShowRejectDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !flightPlan) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading flight plan...
      </div>
    );
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
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Unsaved changes
            </div>
          )}
          
          <Protected scope="scheduling.flightplan.approve">
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
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(true)}
                disabled={flightPlan.status === "APPROVED" || isLoading || hasChanges}
                title={hasChanges ? "Save changes before approving" : flightPlan.status === "APPROVED" ? "Already approved" : ""}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          </Protected>

          <Protected scope="scheduling.flightplan.update">
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              variant={hasChanges ? "default" : "outline"}
            >
              <Save className="mr-2 h-4 w-4" />
              {hasChanges ? "Save as New Version" : "No Changes"}
            </Button>
          </Protected>
          </div>
        </div>
      </div>

      <FlightPlanSteps status={flightPlan.status} />

       
          <Card className="border-2">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    Mission Overview
                  </CardTitle>
                  <CardDescription>
                    Configuration and metadata for this flight plan
                  </CardDescription>
                </div>
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${
                  flightPlan.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                  flightPlan.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                  flightPlan.status === 'TRANSMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  flightPlan.status === 'ASSIGNED_TO_OVERPASS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      flightPlan.status === 'APPROVED' ? 'bg-green-500' :
                      flightPlan.status === 'REJECTED' ? 'bg-red-500' :
                      flightPlan.status === 'TRANSMITTED' ? 'bg-blue-500' :
                      flightPlan.status === 'ASSIGNED_TO_OVERPASS' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`} />
                    {flightPlan.status.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              </div>
            </CardHeader>
            {/*TODO We need to request more data to be able to display the flight plan details*/}
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Name</p>
                  <p className="font-medium">{flightPlan.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Satellite</p>
                  <p className="font-medium">{flightPlan.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ground Station</p>
                  <p className="font-medium">{flightPlan.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{flightPlan.name || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commands</CardTitle>
          <CardDescription>
            Edit the command sequence for this flight plan. Changes will create a new version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommandBuilder
            commands={commands}
            onCommandsChange={handleCommandsChange}
            isReadOnly={false}
          />
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Flight Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this flight plan? This action
              will schedule the command sequence for execution.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleApprove}>
              {isLoading ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Flight Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this flight plan? This action will
              cancel the scheduled command sequence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
