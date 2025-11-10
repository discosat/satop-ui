import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import type { GroundStation } from "@/app/api/ground-stations/types";

const MAX_STATIONS = 4;

export type GroundStationStatus = "online" | "offline";

export interface GroundStationHealth {
  id: number;
  name: string;
  status: GroundStationStatus;
  connected: boolean;
  createdAt?: string;
  latitude: number;
  longitude: number;
}

function deriveStatus(station: GroundStation): GroundStationStatus {
  return station.connected ? "online" : "offline";
}

function sortStations(a: GroundStation, b: GroundStation): number {
  if (a.connected === b.connected) {
    return a.name.localeCompare(b.name);
  }

  return Number(b.connected) - Number(a.connected);
}

export async function getGroundStationHealth(): Promise<GroundStationHealth[]> {
  try {
    const stations = await getGroundStations();

    return stations
      .slice()
      .sort(sortStations)
      .slice(0, MAX_STATIONS)
      .map((station) => ({
        id: station.id,
        name: station.name,
        status: deriveStatus(station),
        connected: station.connected,
        createdAt: station.createdAt,
        latitude: station.location.latitude,
        longitude: station.location.longitude,
      }));
  } catch (error) {
    console.error("Failed to load ground station health:", error);
    return [];
  }
}

