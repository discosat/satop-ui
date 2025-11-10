"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Info, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import type { FlightPlan, FlightPlanStatus } from "@/app/api/flight/types";
import type { Satellite } from "@/app/api/satellites/types";
import type { GroundStation } from "@/app/api/ground-stations/types";
import type { User } from "@/app/api/users/types";

interface MissionOverviewProps {
  flightPlan: FlightPlan;
  satellites: Satellite[];
  groundStations: GroundStation[];
  users: User[];
  onViewMetadata: () => void;
}

export function MissionOverview({
  flightPlan,
  satellites,
  groundStations,
  users,
  onViewMetadata,
}: MissionOverviewProps) {
  return (
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
          <FlightStatusBadge status={flightPlan.status as FlightPlanStatus} />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Key Information Grid */}
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
              {flightPlan.createdById ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium cursor-help">
                      {users.find(u => u.id === flightPlan.createdById)?.name || `User ${flightPlan.createdById}`}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      Role: {users.find(u => u.id === flightPlan.createdById)?.role || "Unknown"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <p className="font-medium">-</p>
              )}
            </div>
          </div>

          {/* View All Details Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewMetadata}
              className="w-full md:w-auto"
            >
              <Info className="mr-2 h-4 w-4" />
              View All Metadata
            </Button>
          </div>

          {/* Schedule/Failed/Transmitted Status Alert */}
          {flightPlan.status === "TRANSMITTED" && flightPlan.scheduledAt && (
            <Alert className="border-blue-500/50 bg-blue-500/10">
              <CheckCircle2 className="h-4 w-4 text-blue-500" />
              <AlertDescription className="ml-2">
                <div className="space-y-1">
                  <div className="font-medium text-blue-700">Transmitted Successfully</div>
                  <div className="text-xs text-muted-foreground">
                    Executed at: {new Date(flightPlan.scheduledAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {flightPlan.status === "ASSIGNED_TO_OVERPASS" && flightPlan.scheduledAt && (
            <Alert className="border-purple-500/50 bg-purple-500/10">
              <Clock className="h-4 w-4 text-purple-500" />
              <AlertDescription className="ml-2">
                <div className="space-y-1">
                  <div className="font-medium text-purple-700">Scheduled for Overpass</div>
                  <div className="text-xs text-muted-foreground">
                    Scheduled at: {new Date(flightPlan.scheduledAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {flightPlan.status === "FAILED" && flightPlan.scheduledAt && (
            <Alert className="border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription className="ml-2">
                <div className="space-y-1">
                  <div className="font-medium text-destructive">Transmission Failed</div>
                  <div className="text-xs text-muted-foreground">
                    Failed at: {new Date(flightPlan.scheduledAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
