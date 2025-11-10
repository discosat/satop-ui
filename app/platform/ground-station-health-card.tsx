import Link from "next/link";
import { Radio, MapPin, Activity, AlertCircle, ShieldCheck } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { GroundStationHealth } from "./get-ground-station-health";

interface GroundStationHealthCardProps {
  stations: GroundStationHealth[];
}

function formatLocation(latitude: number, longitude: number): string {
  const latSuffix = latitude >= 0 ? "N" : "S";
  const lonSuffix = longitude >= 0 ? "E" : "W";
  const lat = `${Math.abs(latitude).toFixed(1)}°${latSuffix}`;
  const lon = `${Math.abs(longitude).toFixed(1)}°${lonSuffix}`;
  return `${lat}, ${lon}`;
}

function getStatusBadge(station: GroundStationHealth) {
  if (station.status === "online") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
        Online
      </Badge>
    );
  }

  return (
    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
      Offline
    </Badge>
  );
}

export function GroundStationHealthCard({
  stations,
}: GroundStationHealthCardProps) {
  if (!stations || stations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ground Station Health</CardTitle>
          <CardDescription>Monitoring connectivity status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
          <AlertCircle className="h-10 w-10" />
          <p className="text-sm">No ground station telemetry available.</p>
          <Button asChild size="sm" variant="outline">
            <Link href="/administration/ground-stations">
              Manage ground stations
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Ground Station Health</CardTitle>
            <CardDescription>Network readiness snapshot</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-semibold">
            {stations.filter((station) => station.status === "online").length} /{" "}
            {stations.length} online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-4">
          {stations.map((station) => (
            <div
              key={station.id}
              className={cn(
                "rounded-lg border p-4 transition-colors",
                station.status === "online"
                  ? "border-emerald-200 bg-emerald-100/40"
                  : "border-red-200 bg-red-100/30",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Radio className="h-4 w-4" />
                    {station.name}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatLocation(station.latitude, station.longitude)}
                  </div>
                </div>
                {getStatusBadge(station)}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Activity className="h-3.5 w-3.5" />
            Live link status sourced from platform telemetry.
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Updates every minute; visit the ground-station directory for full
            diagnostics.
          </div>
          <Button asChild size="sm" variant="ghost" className="px-0">
            <Link href="/administration/ground-stations">
              View ground station directory
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

