import { Satellite } from "react-sat-map";
import { getGroundStations } from "@/app/api/platform/ground-stations/ground-station-service";
import { getSatellites } from "@/app/api/platform/satellites/satellite-service";
import type { Satellite as ApiSatellite } from "@/app/api/platform/satellites/mock";

import { SatelliteMap } from "./satellite-map";
import { OverpassCalendar } from "./overpass-calendar";

export default async function Page() {
  const groundStations = await getGroundStations();
  const apiSatellites = await getSatellites();

  // Transform API satellite data to react-sat-map format
  const satellitesWithTLE: Satellite[] = apiSatellites
    .filter((sat: ApiSatellite) => sat.tleLine1 && sat.tleLine2)
    .map((sat: ApiSatellite) => ({
      name: sat.name,
      tle: {
        line1: sat.tleLine1!,
        line2: sat.tleLine2!,
      },
    }));

  return (
    <div className="relative w-full flex flex-row p-4 gap-4 flex-1">
      <OverpassCalendar satellites={satellitesWithTLE} />
      <SatelliteMap
        satellites={satellitesWithTLE}
        groundStations={groundStations}
      />
    </div>
  );
}
