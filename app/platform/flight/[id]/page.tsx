"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle, XCircle } from "lucide-react";
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

export default function FlightPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedPlanData, setUpdatedPlanData] = useState<string | null>(null);

  const id = typeof params.id === "string" ? params.id : "";
  console.log(id);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!id) return;
      try {
        const plan = await getFlightPlanById(id);
        if (!isCancelled) {
          setFlightPlan(plan);
        }
      } catch (error) {
        console.error("Failed to load flight plan", error);
        if (!isCancelled) {
          setFlightPlan(null);
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
    if (!flightPlan || !updatedPlanData) return;

    setIsLoading(true);
    try {
      // Parse the updated flight plan data
      let parsedData;
      try {
        parsedData = JSON.parse(updatedPlanData);
      } catch {
        throw new Error("Invalid JSON format in flight plan data");
      }

      // Create updated flight plan object
      const updatedFlightPlan: FlightPlan = {
        ...flightPlan,
        flight_plan: {
          ...flightPlan.flight_plan,
          body: parsedData,
        },
      };

      // Call the API to update the flight plan
      const result = await updateFlightPlan(updatedFlightPlan);
      
      if (result) {
        // Update the local state with the returned data
        setFlightPlan(result);
        setUpdatedPlanData(null); // Clear the pending changes
        toast.success("Flight plan updated successfully");
      } else {
        throw new Error("Failed to update flight plan");
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
    if (!flightPlan) return;

    setIsLoading(true);
    try {
      const success = await approveFlightPlan(flightPlan.id, true);
      
      if (success) {
        setFlightPlan({
          ...flightPlan,
          status: "approved",
        });
        setShowApproveDialog(false);
        toast.success("Flight plan approved successfully");
        
        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        throw new Error("Failed to approve flight plan");
      }
    } catch (err) {
      console.error("Failed to approve flight plan:", err);
      const message = err instanceof Error ? err.message : "Failed to approve flight plan";
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
      const success = await approveFlightPlan(flightPlan.id, false);
      
      if (success) {
        setFlightPlan({
          ...flightPlan,
          status: "rejected",
        });
        setShowRejectDialog(false);
        toast.success("Flight plan rejected successfully");
        
        // Navigate back after a short delay
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        throw new Error("Failed to reject flight plan");
      }
    } catch (err) {
      console.error("Failed to reject flight plan:", err);
      const message = err instanceof Error ? err.message : "Failed to reject flight plan";
      toast.error(message);
      setShowRejectDialog(false);
    } finally {
      setIsLoading(false);
    }
  };

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
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
          <Button onClick={handleSave} disabled={isLoading || !updatedPlanData}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
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
              <p className="text-sm text-muted-foreground">
                {flightPlan.sat_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Ground Station</p>
              <p className="text-sm text-muted-foreground">
                {flightPlan.gs_id}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Scheduled Time</p>
              <p className="text-sm text-muted-foreground">
                {new Date(flightPlan.datetime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground capitalize">
                {flightPlan.status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Planner */}
      <FlightPlanner
        initialData={flightPlan}
        onSave={handleFlightPlannerSave}
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
