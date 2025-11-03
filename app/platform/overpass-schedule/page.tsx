import { Metadata } from "next";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { SatelliteOverpassClient } from "./satellite-overpass-client";


export const metadata: Metadata = {
  title: "Discosat: Satellite Overpass",
};

export default async function Page() {
  const groundStations = await getGroundStations();
  const satellites = await getSatellites();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center flex-shrink-0 p-6 pb-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Overpass Schedule</h1>
          <p className="text-muted-foreground">
            Select satellites, ground stations, and time periods to view overpass information.
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-6 pb-6">
        <SatelliteOverpassClient
          satellites={satellites}
          groundStations={groundStations}
        />
      </div>
    </div>
  );
}
