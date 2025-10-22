"use server";

import { apiClient } from "@/app/api/api-client";
import { getMockOverpassWindows } from "./mock";
import { Overpass, OverpassQueryParams } from "./types";

const API_PATH = '/overpasses';



export async function getOverpassWindows(
  satelliteId: number,
  groundStationId: number,
  params?: OverpassQueryParams
): Promise<Overpass[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return getMockOverpassWindows(satelliteId, groundStationId, params);
  }

  try {
    const cleanParams = (obj: OverpassQueryParams | undefined) => {
      if (!obj) return {};
      return Object.fromEntries(
        Object.entries(obj).filter(([, v]) => v != null)
      ) as Record<string, string>;
    };

    const query = new URLSearchParams(cleanParams(params)).toString();
    const pathWithQuery = `${API_PATH}/satellite/${satelliteId}/groundstation/${groundStationId}${query ? '?' + query : ''}`;
    
    return await apiClient.get<Overpass[]>(pathWithQuery);
    
  } catch (error) {
    console.error("Error fetching overpass windows:", error);
    return [];
  }
}