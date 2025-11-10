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
import { AlertCircle, CalendarClock, Navigation } from "lucide-react";
import type { OverpassQueueSnapshotData } from "./get-overpass-queue";
import { getPassQuality } from "@/components/overpass/overpass-utils";

interface OverpassQueueSnapshotProps {
  data: OverpassQueueSnapshotData | null;
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(target: Date, reference: Date): string {
  const diffMs = target.getTime() - reference.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (diffMinutes > 120) {
    const diffHours = Math.round(diffMinutes / 60);
    return `in ${diffHours} hours`;
  }

  if (diffMinutes > 0) {
    return `in ${diffMinutes} minutes`;
  }

  if (diffMinutes >= -5) {
    return "happening now";
  }

  return "completed";
}

function getAssociationBadge(
  pass: OverpassQueueSnapshotData["passes"][number],
) {
  if (pass.associatedFlightPlan?.id) {
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
        Assigned
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-muted-foreground">
      Unassigned
    </Badge>
  );
}

export function OverpassQueueSnapshot({
  data,
}: OverpassQueueSnapshotProps) {
  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Overpass Queue Snapshot</CardTitle>
          <CardDescription>
            Overview of upcoming windows is temporarily unavailable.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
          <AlertCircle className="h-10 w-10" />
          <p className="text-sm">
            Could not determine satellite or ground-station configuration.
          </p>
          <Button asChild size="sm" variant="outline">
            <Link href="/platform/overpass-schedule">
              Open Overpass Schedule
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { satellite, groundStation, passes, lookAheadHours } = data;

  if (passes.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Overpass Queue Snapshot</CardTitle>
          <CardDescription>
            Next {lookAheadHours} hours for {satellite.name} at {groundStation.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            No additional overpasses queued. New windows will appear here as
            they enter the planning horizon.
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/platform/overpass-schedule">
              Browse full schedule
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle>Overpass Queue Snapshot</CardTitle>
        <CardDescription>
          Tracking the next {passes.length} windows for {satellite.name} at{" "}
          {groundStation.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          {passes.map((pass, index) => {
            const start = new Date(pass.startTime);
            const end = new Date(pass.endTime);
            const quality = getPassQuality(pass.maxElevation);

            return (
              <div
                key={`${pass.startTime}-${pass.endTime}-${index}`}
                className="rounded-lg border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      Queue #{index + 1}
                      {getAssociationBadge(pass)}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      {formatDateTime(start)} – {formatDateTime(end)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(start, now)} • Duration{" "}
                      {(pass.durationSeconds / 60).toFixed(0)} min
                    </p>
                    {pass.associatedFlightPlan?.id && (
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="px-0 text-xs text-primary"
                      >
                        <Link href={`/platform/flight/${pass.associatedFlightPlan.id}`}>
                          View linked flight plan
                        </Link>
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 text-right">
                    <Badge
                      variant="outline"
                      className={`border ${quality.color} text-xs font-semibold`}
                    >
                      {quality.quality}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Navigation className="h-3.5 w-3.5" />
                      Max elev. {pass.maxElevation.toFixed(1)}°
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Horizon window: {lookAheadHours} hours. Adjust filters in the
            Overpass Schedule.
          </span>
          <Button asChild size="sm" variant="ghost">
            <Link href="/platform/overpass-schedule">
              Open schedule
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

