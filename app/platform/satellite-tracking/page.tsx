import { Metadata } from "next";
import { Satellite } from "react-sat-map";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import type { Satellite as ApiSatellite } from "@/app/api/satellites/types";
import { SatelliteTrackingClient } from "./satellite-tracking-client";

export const metadata: Metadata = {
  title: "Discosat: Satellite Tracking",
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
    <div className="flex flex-col h-full gap-6">
      <div className="flex justify-between items-center flex-shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Satellite Tracking</h1>
          <p className="text-muted-foreground">
            Real-time satellite position tracking and orbital visualization.
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <SatelliteTrackingClient
          satellites={satellitesWithTLE}
          groundStations={groundStations}
        />
      </div>
    </div>
  );
}
