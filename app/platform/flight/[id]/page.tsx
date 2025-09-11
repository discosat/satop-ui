"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link"; 
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle, XCircle, History } from "lucide-react";
import { toast } from "sonner";
import FlightPlanner from "../flight-planner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FlightPlan } from "../flight-table";
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
import { getFlightPlanById, updateFlightPlan, approveFlightPlan } from "@/app/api/platform/flight/flight-plan-service";
import { useSession } from "@/app/context";
import Protected from "@/components/protected";

export default function FlightPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedPlanData, setUpdatedPlanData] = useState<string | null>(null);

  const session = useSession();

  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!id || !session) return;
      setIsLoading(true);
      try {
        const plan = await getFlightPlanById(id, session.accessToken);
        if (!isCancelled) {
          setFlightPlan(plan);
        }
      } catch (error) {
        console.error("Failed to load flight plan", error);
        if (!isCancelled) {
          setFlightPlan(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => { isCancelled = true; };
  }, [id, session]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!flightPlan || !updatedPlanData || !session) return;
    setIsLoading(true);
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(updatedPlanData);
      } catch {
        throw new Error("Invalid JSON format in flight plan data");
      }

      const updatedFlightPlanPayload: FlightPlan = {
        ...flightPlan,
        flight_plan: {
          ...flightPlan.flight_plan,
          body: parsedData,
        },
      };

      const newVersion = await updateFlightPlan(updatedFlightPlanPayload, session.accessToken);
      
      if (newVersion?.id) {
        toast.success("New flight plan version created successfully!");
        router.push(`/platform/flight/${newVersion.id}`);
      } else {
        throw new Error("Failed to create new version. API did not return a new flight plan.");
      }
    } catch (err) {
      console.error("Failed to save flight plan:", err);
      const message = err instanceof Error ? err.message : "Failed to save flight plan";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlightPlannerSave = (data: string) => {
    setUpdatedPlanData(data);
  };
  
  const handleApprove = async () => {
    if (!flightPlan || !session) return;
    setIsLoading(true);
    try {
      const result = await approveFlightPlan(flightPlan.id, true, session.accessToken);
      
      if (result.success) {
        setFlightPlan({ ...flightPlan, status: "approved" });
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
    if (!flightPlan || !session) return;
    setIsLoading(true);
    try {
      const result = await approveFlightPlan(flightPlan.id, false, session.accessToken);
      
      if (result.success) {
        setFlightPlan({ ...flightPlan, status: "rejected" });
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
     return <div className="p-6 text-center text-muted-foreground">Loading flight plan...</div>;
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

  const isPending = flightPlan.status === 'pending';

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {flightPlan.flight_plan.name || "Command Sequence"}
          </h1>
        </div>
        
        <div className="flex gap-2">
            <Protected scope="scheduling.flightplan.approve">
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={!isPending || isLoading}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowApproveDialog(true)}
                  disabled={!isPending || isLoading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            </Protected>
            
            <Protected scope="scheduling.flightplan.update">
              <Button onClick={handleSave} disabled={!isPending || isLoading || !updatedPlanData}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </Protected>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flight Plan Details</CardTitle>
          <CardDescription>
            View and edit the command sequence for this flight plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium">Satellite</p>
              <p className="text-sm text-muted-foreground">{flightPlan.sat_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Ground Station</p>
              <p className="text-sm text-muted-foreground">{flightPlan.gs_id}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Scheduled Time</p>
              <p className="text-sm text-muted-foreground">{new Date(flightPlan.scheduled_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground capitalize">{flightPlan.status}</p>
            </div>
            {flightPlan.previous_plan_id && (
              <div className="md:col-span-2">
                <p className="text-sm font-medium">Version History</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="w-4 h-4" />
                  <span>This is a new version of plan:</span>
                  <Link href={`/platform/flight/${flightPlan.previous_plan_id}`} className="text-blue-500 hover:underline truncate">
                    {flightPlan.previous_plan_id}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <FlightPlanner
        initialData={flightPlan}
        onSave={handleFlightPlannerSave}
        isReadOnly={!isPending}
      />

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