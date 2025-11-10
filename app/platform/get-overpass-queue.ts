import { getSatellites } from "@/app/api/satellites/satellite-service";
import type { Satellite } from "@/app/api/satellites/types";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { getOverpassWindows } from "@/app/api/overpass/overpass-service";
import type { Overpass, OverpassQueryParams } from "@/app/api/overpass/types";
import {
  selectPrimaryGroundStation,
  selectPrimarySatellite,
} from "./get-upcoming-pass-spotlight";

const QUEUE_LIMIT = 5;
const LOOKAHEAD_HOURS = 24;

export interface OverpassQueueSnapshotData {
  satellite: Satellite;
  groundStation: GroundStation;
  passes: Overpass[];
  lookAheadHours: number;
}

function buildQueryParams(now: Date): OverpassQueryParams {
  const end = new Date(now.getTime() + LOOKAHEAD_HOURS * 60 * 60 * 1000);

  return {
    startTime: now.toISOString(),
    endTime: end.toISOString(),
    minimumElevation: 5,
    maxResults: 25,
    minimumDuration: 60,
  };
}

function filterUpcomingPasses(passes: Overpass[], now: Date): Overpass[] {
  return passes
    .filter((pass) => new Date(pass.endTime).getTime() >= now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
    .slice(0, QUEUE_LIMIT);
}

export async function getOverpassQueueSnapshot(): Promise<OverpassQueueSnapshotData | null> {
  const [satellites, groundStations] = await Promise.all([
    getSatellites(),
    getGroundStations(),
  ]);

  const satellite = selectPrimarySatellite(satellites);
  const groundStation = selectPrimaryGroundStation(groundStations);

  if (!satellite || !groundStation) {
    return null;
  }

  const now = new Date();
  const params = buildQueryParams(now);

  try {
    const passes = await getOverpassWindows(
      satellite.id,
      groundStation.id,
      params,
    );
    const upcoming = filterUpcomingPasses(passes, now);

    return {
      satellite,
      groundStation,
      passes: upcoming,
      lookAheadHours: LOOKAHEAD_HOURS,
    };
  } catch (error) {
    console.error("Failed to load overpass queue snapshot:", error);
    return {
      satellite,
      groundStation,
      passes: [],
      lookAheadHours: LOOKAHEAD_HOURS,
    };
  }
}

