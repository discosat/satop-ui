"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, CheckCircle, XCircle, Activity, CalendarClock } from "lucide-react";
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
  compileFlightPlanToCsh,
} from "@/app/api/flight/flight-plan-service";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import FlightPlanSteps from "@/app/platform/flight/components/flight-plan-steps";
import { Command, CameraSettings, CaptureLocation } from "../components/commands/command";
import { CommandBuilder } from "../components/commands/command-builder";
import { FlightPlan } from "@/app/api/flight/types";
import type { Satellite } from "@/app/api/satellites/types";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { FlightPlanSkeleton } from "./flight-plan-skeleton";

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
  const [compiledScript, setCompiledScript] = useState<string[] | null>(null);
  const [lgtmInput, setLgtmInput] = useState("");
  const [isLoadingScript, setIsLoadingScript] = useState(false);

  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Fetch all data in parallel
        const [plan, sats, stations] = await Promise.all([
          getFlightPlanById(Number(id)),
          getSatellites(),
          getGroundStations(),
        ]);

        if (!isCancelled) {
          setFlightPlan(plan);
          setSatellites(sats);
          setGroundStations(stations);
          
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

  const handleApprove = async () => {
    if (!flightPlan) return;
    
    // Check LGTM confirmation
    if (lgtmInput.toUpperCase() !== "LGTM") {
      toast.error("Please confirm with 'LGTM'");
      return;
    }

    setIsLoading(true);
    try {
      const result = await approveFlightPlan(
        flightPlan.id,
        true
      );

      if (result.success) {
        setFlightPlan({ ...flightPlan, status: "APPROVED" });
        setShowApproveDialog(false);
        setLgtmInput("");
        setCompiledScript(null);
        toast.success(result.message);
        // Stay on page and refresh - don't navigate back
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

  const handleOpenApproveDialog = async () => {
    if (!flightPlan) return;
    
    setShowApproveDialog(true);
    setIsLoadingScript(true);
    
    try {
      // Load the compiled script
      const cshResult = await compileFlightPlanToCsh(flightPlan.id);
      if (cshResult?.script) {
        setCompiledScript(cshResult.script);
      }
    } catch (error) {
      console.error("Error loading compiled script:", error);
      toast.error("Failed to load compiled script");
    } finally {
      setIsLoadingScript(false);
    }
    
    setLgtmInput("");
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
          {hasChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Unsaved changes
            </div>
          )}
          
          {/* Show Assign to Overpass button when status is APPROVED or FAILED */}
          {(flightPlan.status === "APPROVED" || flightPlan.status === "FAILED") && (
            <Button
              variant="default"
              onClick={() => router.push(`/platform/flight/${id}/assign-overpass`)}
              disabled={isLoading}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              {flightPlan.status === "FAILED" ? "Retry Transmission" : "Assign to Overpass"}
            </Button>
          )}

          {/* Show assigned overpass info when status is ASSIGNED_TO_OVERPASS */}
          {flightPlan.status === "ASSIGNED_TO_OVERPASS" && flightPlan.scheduledAt && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-md text-sm text-purple-800">
              <CalendarClock className="h-4 w-4" />
              <span className="font-medium">
                Scheduled: {new Date(flightPlan.scheduledAt).toLocaleString("da-DK", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}

          {/* Show assigned overpass info or retry option when status is FAILED */}
          {flightPlan.status === "FAILED" && flightPlan.scheduledAt && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              <CalendarClock className="h-4 w-4" />
              <span className="font-medium">
                Failed at: {new Date(flightPlan.scheduledAt).toLocaleString("da-DK", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}

          {/* <Protected scope=""> */}
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
                onClick={handleOpenApproveDialog}
                disabled={flightPlan.status === "APPROVED" || isLoading || hasChanges}
                title={hasChanges ? "Save changes before approving" : flightPlan.status === "APPROVED" ? "Already approved" : ""}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
{/*           </Protected> */}

          {/* <Protected scope=""> */}
            <Button
              onClick={handleSave}
              disabled={isLoading || !hasChanges}
              variant={hasChanges ? "default" : "outline"}
            >
              <Save className="mr-2 h-4 w-4" />
              {hasChanges ? "Save as New Version" : "No Changes"}
            </Button>
          {/* </Protected> */}
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
                  flightPlan.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                  flightPlan.status === 'TRANSMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  flightPlan.status === 'ASSIGNED_TO_OVERPASS' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      flightPlan.status === 'APPROVED' ? 'bg-green-500' :
                      flightPlan.status === 'REJECTED' ? 'bg-red-500' :
                      flightPlan.status === 'FAILED' ? 'bg-red-500' :
                      flightPlan.status === 'TRANSMITTED' ? 'bg-blue-500' :
                      flightPlan.status === 'ASSIGNED_TO_OVERPASS' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`} />
                    {flightPlan.status.toLowerCase().replace('_', ' ')}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan Name</p>
                  <p className="font-medium">{flightPlan.name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Satellite</p>
                  <p className="font-medium">
                    {satellites.find(s => s.id === flightPlan.satId)?.name || `ID: ${flightPlan.satId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ground Station</p>
                  <p className="font-medium">
                    {groundStations.find(gs => gs.id === flightPlan.gsId)?.name || `ID: ${flightPlan.gsId}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created By</p>
                  <p className="font-medium">{"-"}</p>
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
        <AlertDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <AlertDialogHeader>
            <AlertDialogTitle>Review & Approve Flight Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Review the compiled command sequence below. Type &#34;LGTM&#34; to approve.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {isLoadingScript ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="animate-spin inline-block w-6 h-6 border-2 border-slate-600 border-t-slate-200 rounded-full"></div>
                  <p className="text-sm text-muted-foreground">Loading compiled script...</p>
                </div>
              </div>
            ) : compiledScript && compiledScript.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm font-semibold">Compiled Command Script:</div>
                <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto border border-slate-700 shadow-lg">
                  <div className="space-y-1">
                    {compiledScript.map((line, idx) => (
                      <div key={idx} className="flex hover:bg-slate-900 px-2 py-0.5 rounded transition-colors">
                        <span className="mr-4 text-slate-600 select-none w-12 text-right">{idx + 1}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No compiled script available</p>
              </div>
            )}

            <div className="space-y-3 pt-4 border-t px-1">
              <label className="text-sm font-medium">Confirm approval by typing &#34;LGTM&#34;:</label>
              <Input
                placeholder="Type LGTM to confirm"
                value={lgtmInput}
                onChange={(e) => setLgtmInput(e.target.value)}
                className="font-mono"
                disabled={isLoading || isLoadingScript}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isLoading && !isLoadingScript && lgtmInput.toUpperCase() === "LGTM") {
                    handleApprove();
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {lgtmInput.length > 0 && lgtmInput.toUpperCase() !== "LGTM" 
                  ? "Looks good to merge! (Type exactly: LGTM)"
                  : "Looks good to merge! "}
              </p>
            </div>
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isLoading || isLoadingScript}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove}
              disabled={isLoading || lgtmInput.toUpperCase() !== "LGTM"}
              className={lgtmInput.toUpperCase() === "LGTM" ? "" : "opacity-50 cursor-not-allowed"}
            >
              {isLoading ? "Approving..." : "Approve (LGTM)"}
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
