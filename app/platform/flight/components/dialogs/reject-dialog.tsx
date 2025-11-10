"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { approveFlightPlan } from "@/app/api/flight/flight-plan-service";
import { toast } from "sonner";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flightPlanId: number;
  flightPlanName?: string;
  onRejectionSuccess: () => void;
}

export function RejectDialog({
  open,
  onOpenChange,
  flightPlanId,
  flightPlanName,
  onRejectionSuccess,
}: RejectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    setIsLoading(true);
    try {
      const result = await approveFlightPlan(flightPlanId, false);

      if (result.success) {
        toast.success(result.message);
        onOpenChange(false);
        onRejectionSuccess();
      } else {
        throw new Error(result.message || "Failed to reject flight plan");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rejection failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Flight Plan</DialogTitle>
          <DialogDescription>
            Are you sure you want to reject {flightPlanName ? `"${flightPlanName}"` : "this flight plan"}? 
            This action will cancel the scheduled command sequence.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleReject}
            variant="destructive"
            disabled={isLoading}
          >
            {isLoading ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
