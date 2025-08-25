"use server";

import { revalidatePath } from "next/cache";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { getGroundStations as fetchGroundStations } from "@/app/api/platform/ground-stations/ground-station-service";

export async function refreshGroundStations() {
  revalidatePath("/platform/ground-stations");
  return { success: true };
}

export async function searchGroundStations(query: string): Promise<GroundStation[]> {
  const stations = await fetchGroundStations();
  if (!query) return stations;
  const q = query.toLowerCase();
  return stations.filter((gs) =>
    gs.name.toLowerCase().includes(q) ||
    gs.websocket_url.toLowerCase().includes(q)
  );
} 