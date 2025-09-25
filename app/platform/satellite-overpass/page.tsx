import { Metadata } from "next";
import { Satellite } from "react-sat-map";
import { getGroundStations } from "@/app/api/platform/ground-stations/ground-station-service";
import { getSatellites } from "@/app/api/platform/satellites/satellite-service";
import type { Satellite as ApiSatellite } from "@/app/api/platform/satellites/satellite-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SatelliteOverpassClient } from "./satellite-overpass-client";


export const metadata: Metadata = {
  title: "Discosat: Satellite Overpass",
};

export default async function Page() {
  const groundStations = await getGroundStations();
  const apiSatellites = await getSatellites();

  // Transform API satellite data to react-sat-map format with ID preservation
  const satellitesWithTLE: (Satellite & { id: number })[] = apiSatellites
    .filter((sat: ApiSatellite) => sat.tle.line1 && sat.tle.line2)
    .map((sat: ApiSatellite) => ({
      id: sat.id,
      name: sat.name,
      tle: {
        line1: sat.tle.line1,
        line2: sat.tle.line2,
      },
    }));

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Satellite Overpass</h1>
          <p className="text-muted-foreground">
            View satellite overpasses and ground station locations.
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-1 flex-shrink-0">
          <CardTitle>Overpass Schedule</CardTitle>
          <CardDescription>
            Select satellites, ground stations, and time periods to view overpass information and real-time satellite tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <SatelliteOverpassClient
            satellites={satellitesWithTLE}
            groundStations={groundStations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
