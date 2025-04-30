"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, CheckCircle, XCircle } from "lucide-react";
import FlightPlanner from "../flight-planner";
import { mockFlightPlans } from "../mock";
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
import { toast } from "sonner";

export default function FlightPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatedPlanData, setUpdatedPlanData] = useState<string | null>(null);

  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    // In a real app, you would fetch the flight plan from an API
    // For now, we'll use the mock data
    const plan = mockFlightPlans.find((p) => p.id === id) || null;
    setFlightPlan(plan);
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    if (!flightPlan || !updatedPlanData) return;

    setIsLoading(true);
    // Simulate API call to save the updated flight plan
    setTimeout(() => {
      try {
        // Parse the updated flight plan data
        const parsedData = JSON.parse(updatedPlanData);

        // Update the local state with the new data
        setFlightPlan({
          ...flightPlan,
          flight_plan: {
            ...flightPlan.flight_plan,
            body: parsedData,
          },
        });

        toast.success("Flight plan saved successfully");
      } catch (err) {
        console.error("Failed to save flight plan:", err);
        toast.error("Failed to save flight plan: Invalid JSON");
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleFlightPlannerSave = (data: string) => {
    setUpdatedPlanData(data);
    handleSave();
  };

  const handleApprove = () => {
    if (!flightPlan) return;

    setIsLoading(true);
    // Simulate API call to approve the flight plan
    setTimeout(() => {
      setFlightPlan({
        ...flightPlan,
        status: "approved",
      });

      toast.success("Flight plan approved");
      setIsLoading(false);
      setShowApproveDialog(false);

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    }, 1000);
  };

  const handleReject = () => {
    if (!flightPlan) return;

    setIsLoading(true);
    // Simulate API call to reject the flight plan
    setTimeout(() => {
      setFlightPlan({
        ...flightPlan,
        status: "rejected",
      });

      toast.error("Flight plan rejected");
      setIsLoading(false);
      setShowRejectDialog(false);

      // Navigate back after a short delay
      setTimeout(() => {
        router.back();
      }, 1500);
    }, 1000);
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
          {flightPlan.status === "pending" && (
            <>
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
            </>
          )}
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
