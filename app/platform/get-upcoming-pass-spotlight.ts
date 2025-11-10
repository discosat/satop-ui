import { getSatellites } from "@/app/api/satellites/satellite-service";
import type { Satellite } from "@/app/api/satellites/types";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { getOverpassWindows } from "@/app/api/overpass/overpass-service";
import type { Overpass } from "@/app/api/overpass/types";
import { getFlightPlanById } from "@/app/api/flight/flight-plan-service";
import type { FlightPlan } from "@/app/api/flight/types";

const LOOKAHEAD_HOURS = 24;

export function selectPrimarySatellite(
  satellites: Satellite[],
): Satellite | undefined {
  if (satellites.length === 0) {
    return undefined;
  }

  return satellites.find((sat) => sat.status === "ACTIVE") ?? satellites[0];
}

export function selectPrimaryGroundStation(
  groundStations: GroundStation[],
): GroundStation | undefined {
  if (groundStations.length === 0) {
    return undefined;
  }

  return groundStations.find((gs) => gs.connected) ?? groundStations[0];
}

function pickBestUpcomingPass(overpasses: Overpass[], now: Date): Overpass | null {
  if (overpasses.length === 0) {
    return null;
  }

  const upcoming = overpasses.filter(
    (pass) => new Date(pass.endTime).getTime() >= now.getTime(),
  );

  if (upcoming.length === 0) {
    return null;
  }

  return upcoming.sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  )[0];
}

export interface UpcomingPassSpotlightData {
  satellite: Satellite;
  groundStation: GroundStation;
  pass: Overpass | null;
  flightPlan: FlightPlan | null;
  lookAheadHours: number;
}

export async function getUpcomingPassSpotlight(): Promise<UpcomingPassSpotlightData | null> {
  const [satellites, groundStations] = await Promise.all([
    getSatellites(),
    getGroundStations(),
  ]);

  const primarySatellite = selectPrimarySatellite(satellites);
  const primaryGroundStation = selectPrimaryGroundStation(groundStations);

  if (!primarySatellite || !primaryGroundStation) {
    return null;
  }

  const now = new Date();
  const end = new Date(now.getTime() + LOOKAHEAD_HOURS * 60 * 60 * 1000);

  try {
    const overpasses = await getOverpassWindows(
      primarySatellite.id,
      primaryGroundStation.id,
      {
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        minimumElevation: 5,
        maxResults: 20,
        minimumDuration: 60,
      },
    );

    const bestPass = pickBestUpcomingPass(overpasses, now);
    let flightPlan: FlightPlan | null = null;

    if (bestPass?.associatedFlightPlan?.id) {
      flightPlan = await getFlightPlanById(bestPass.associatedFlightPlan.id);
    }

    return {
      satellite: primarySatellite,
      groundStation: primaryGroundStation,
      pass: bestPass,
      flightPlan,
      lookAheadHours: LOOKAHEAD_HOURS,
    };
  } catch (error) {
    console.error("Failed to load upcoming pass spotlight:", error);
    return {
      satellite: primarySatellite,
      groundStation: primaryGroundStation,
      pass: null,
      flightPlan: null,
      lookAheadHours: LOOKAHEAD_HOURS,
    };
  }
}

