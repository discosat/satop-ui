import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Clock, CheckCircle2, Ban } from "lucide-react";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import type { FlightPlanActivityEntry } from "./get-flight-plan-activity-feed";
import type { FlightPlanStatus } from "@/app/api/flight/types";

interface FlightPlanActivityFeedProps {
  entries: FlightPlanActivityEntry[];
}

function formatDateTime(date: string | undefined): string {
  if (!date) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function FlightPlanActivityFeed({ entries }: FlightPlanActivityFeedProps) {
  if (!entries || entries.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Flight Plan Activity</CardTitle>
          <CardDescription>Latest submissions, approvals, and updates</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
          <AlertCircle className="h-10 w-10" />
          <p className="text-sm">No recent activity recorded.</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/platform/flight">View flight plans</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle>Flight Plan Activity</CardTitle>
        <CardDescription>Latest updates across the flight-planning lifecycle</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border bg-muted/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FlightStatusBadge status={entry.status as FlightPlanStatus} />
                    <Link
                      href={`/platform/flight/${entry.id}`}
                      className="text-sm font-semibold text-foreground hover:underline"
                    >
                      {entry.name}
                    </Link>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {formatDateTime(entry.updatedAt ?? entry.createdAt)}
                  </div>
                </div>
                {entry.approvedBy && (
                  <Badge variant="outline" className="text-xs">
                    Approved by {entry.approvedBy}
                    {entry.approverRole ? ` (${entry.approverRole})` : ""}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved plans are ready for overpass assignment.
          </div>
          <div className="flex items-center gap-2">
            <Ban className="h-3.5 w-3.5" />
            Rejected plans remain visible for revision and superseding.
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" />
            Feed ordered by last update; only the five most recent events are shown.
          </div>
          <Button asChild size="sm" variant="ghost" className="self-start">
            <Link href="/platform/flight">Go to flight plans</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

