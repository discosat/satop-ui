"use server";

import { mockSatellites } from "./mock";
import { apiClient } from "@/lib/api-client";
import type { Satellite } from "./types";
const API_PATH = '/satellites';

export async function getSatellites(): Promise<Satellite[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockSatellites as Satellite[];
  }

  try {
    return await apiClient.get<Satellite[]>(API_PATH);
  } catch (error) {
    console.error("Error fetching satellites:", error);
    return [];
  }
}

export async function getSatelliteById(id: string): Promise<Satellite | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return (mockSatellites.find(sat => sat.id === parseInt(id)) as Satellite | undefined) || null;
  }

  try {
    return await apiClient.get<Satellite>(`${API_PATH}/${id}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    console.error(`Error fetching satellite ${id}:`, error);
    return null;
  }
}