"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import type { FlightPlan, FlightPlanStatus } from "@/app/api/flight/types";
import type { Satellite } from "@/app/api/satellites/types";
import type { GroundStation } from "@/app/api/ground-stations/types";
import type { User } from "@/app/api/users/types";
import { useRouter } from "next/navigation";

interface MetadataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flightPlan: FlightPlan;
  satellites: Satellite[];
  groundStations: GroundStation[];
  users: User[];
}

export function MetadataModal({
  open,
  onOpenChange,
  flightPlan,
  satellites,
  groundStations,
  users,
}: MetadataModalProps) {
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Flight Plan Metadata</DialogTitle>
          <DialogDescription>
            Complete details and history for {flightPlan.name || "this flight plan"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-primary">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Flight Plan ID</p>
                <p className="font-medium">#{flightPlan.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan Name</p>
                <p className="font-medium">{flightPlan.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Satellite</p>
                <p className="font-medium">
                  {satellites.find(s => s.id === flightPlan.satId)?.name || `ID: ${flightPlan.satId}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ground Station</p>
                <p className="font-medium">
                  {flightPlan.gsId == null ? "Deleted" : (groundStations.find(gs => gs.id === flightPlan.gsId)?.name || `ID: ${flightPlan.gsId}`)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <FlightStatusBadge status={flightPlan.status as FlightPlanStatus} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Number of Commands</p>
                <p className="font-medium">{flightPlan.commands?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* User & Timestamps */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold text-primary">Timeline & Authors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Created By</p>
                {flightPlan.createdById ? (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {users.find(u => u.id === flightPlan.createdById)?.name || `User ${flightPlan.createdById}`}
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
                      {users.find(u => u.id === flightPlan.createdById)?.role || "Unknown"}
                    </span>
                  </div>
                ) : (
                  <p className="font-medium text-muted-foreground">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {flightPlan.createdAt 
                    ? new Date(flightPlan.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {flightPlan.status === "APPROVED" ? "Approved By" : 
                   flightPlan.status === "REJECTED" ? "Rejected By" : 
                   "Approver"}
                </p>
                {flightPlan.approvedById ? (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">
                      {users.find(u => u.id === flightPlan.approvedById)?.name || `User ${flightPlan.approvedById}`}
                    </p>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full">
                      {users.find(u => u.id === flightPlan.approvedById)?.role || "Unknown"}
                    </span>
                  </div>
                ) : (
                  <p className="font-medium text-muted-foreground">-</p>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {flightPlan.status === "APPROVED" ? "Approved At" : 
                   flightPlan.status === "REJECTED" ? "Rejected At" : 
                   "Approval Date"}
                </p>
                <p className="font-medium">
                  {flightPlan.approvalDate 
                    ? new Date(flightPlan.approvalDate).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {flightPlan.updatedAt 
                    ? new Date(flightPlan.updatedAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Version & Scheduling Info */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="text-sm font-semibold text-primary">Version & Scheduling</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flightPlan.previousPlanId && (
                <div>
                  <p className="text-xs text-muted-foreground">Previous Version</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => {
                      onOpenChange(false);
                      router.push(`/platform/flight/${flightPlan.previousPlanId}`);
                    }}
                  >
                    Flight Plan #{flightPlan.previousPlanId} →
                  </Button>
                </div>
              )}
              {flightPlan.overpassId && (
                <div>
                  <p className="text-xs text-muted-foreground">Overpass ID</p>
                  <p className="font-medium">{flightPlan.overpassId}</p>
                </div>
              )}
              {flightPlan.scheduledAt && (
                <div>
                  <p className="text-xs text-muted-foreground">Scheduled Execution</p>
                  <p className="font-medium">
                    {new Date(flightPlan.scheduledAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
