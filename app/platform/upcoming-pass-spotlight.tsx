import Link from "next/link";
import {
  CalendarDays,
  Clock,
  Navigation,
  Satellite as SatelliteIcon,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FlightStatusBadge } from "@/components/FlightStatusBadge";
import type { FlightPlanStatus } from "@/app/api/flight/types";
import type { UpcomingPassSpotlightData } from "./get-upcoming-pass-spotlight";

interface UpcomingPassSpotlightProps {
  data: UpcomingPassSpotlightData | null;
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

function getPassQuality(elevation: number): { label: string; className: string } {
  if (elevation >= 60) {
    return {
      label: "Excellent",
      className: "bg-green-100 text-green-800 border-green-200",
    };
  }

  if (elevation >= 40) {
    return {
      label: "Great",
      className: "bg-blue-100 text-blue-800 border-blue-200",
    };
  }

  if (elevation >= 25) {
    return {
      label: "Good",
      className: "bg-orange-100 text-orange-800 border-orange-200",
    };
  }

  if (elevation >= 15) {
    return {
      label: "Fair",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
  }

  return {
    label: "Poor",
    className: "bg-red-100 text-red-800 border-red-200",
  };
}

function formatLocation(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2)}°${latitude >= 0 ? "N" : "S"}`;
  const lon = `${Math.abs(longitude).toFixed(2)}°${longitude >= 0 ? "E" : "W"}`;
  return `${lat}, ${lon}`;
}

export function UpcomingPassSpotlight({ data }: UpcomingPassSpotlightProps) {
  if (!data) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Upcoming Pass Spotlight</CardTitle>
          <CardDescription>
            We could not load satellite and ground station information.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
          <AlertCircle className="h-10 w-10" />
          <p>Check your data sources or try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const { satellite, groundStation, pass, flightPlan, lookAheadHours } = data;

  if (!pass) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Upcoming Pass Spotlight</CardTitle>
          <CardDescription>
            No overpasses in the next {lookAheadHours} hours for the default satellite/ground station pair.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <SatelliteIcon className="mt-1 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{satellite.name}</p>
              <p className="text-xs text-muted-foreground">
                Tracking paired with {groundStation.name}
              </p>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            We&apos;ll surface the next high-quality window automatically once new orbital passes are available.
          </div>
          <Button asChild variant="outline">
            <Link href="/platform/overpass-schedule">
              Browse overpass schedule
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const startTime = new Date(pass.startTime);
  const endTime = new Date(pass.endTime);
  const now = new Date();
  const relative = formatRelativeTime(startTime, now);
  const quality = getPassQuality(pass.maxElevation);
  const linkedFlightPlan = flightPlan ?? pass.associatedFlightPlan ?? null;
  const flightPlanStatus = (linkedFlightPlan?.status ?? null) as FlightPlanStatus | null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Upcoming Pass Spotlight</CardTitle>
            <CardDescription>
              Highest priority window for {satellite.name} via {groundStation.name}
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={`text-xs font-semibold border ${quality.className}`}
          >
            {quality.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <CalendarDays className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatDateTime(startTime)} &ndash; {formatDateTime(endTime)}
              </p>
              <p className="text-xs text-muted-foreground">Pass {relative}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
            <Navigation className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{groundStation.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatLocation(
                  groundStation.location.latitude,
                  groundStation.location.longitude,
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <SatelliteIcon className="h-4 w-4 text-muted-foreground" />
            {satellite.name}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Max elevation {pass.maxElevation.toFixed(1)}° • Duration {(pass.durationSeconds / 60).toFixed(0)} min
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Flight plan readiness
          </div>

          {linkedFlightPlan ? (
            <div className="flex flex-col gap-2 rounded-lg border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {linkedFlightPlan.name || `Plan #${linkedFlightPlan.id}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  Auto-associated with this pass
                </p>
              </div>
              <div className="flex items-center gap-3">
                {flightPlanStatus ? (
                  <FlightStatusBadge status={flightPlanStatus} />
                ) : (
                  <Badge variant="outline">Status unavailable</Badge>
                )}
                {linkedFlightPlan.id && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/platform/flight/${linkedFlightPlan.id}`}>
                      View plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                No approved flight plan associated with this window yet.
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/platform/flight">
                  Review flight plans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Monitoring the next {lookAheadHours}-hour horizon. Update thresholds from the Overpass Schedule.
          </span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/platform/overpass-schedule">
              Go to Overpass Schedule
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

