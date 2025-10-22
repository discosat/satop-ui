"use server";

import { mockGroundStations } from "./mock";
import { apiClient } from "@/app/api/api-client";
import { CreateGroundStationPayload, GroundStation, GroundStationWithApiKey, UpdateGroundStationPayload } from "./types";

const API_PATH = '/ground-stations';

export async function getGroundStations(): Promise<GroundStation[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockGroundStations;
  }
  try {
    return await apiClient.get<GroundStation[]>(API_PATH);
  } catch (error) {
    console.error("Error fetching ground stations:", error);
    return [];
  }
}

export async function createGroundStation(
  station: CreateGroundStationPayload
): Promise<GroundStationWithApiKey> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const newStation: GroundStationWithApiKey = {
      id: mockGroundStations.length + 1,
      createdAt: new Date().toISOString(),
      isActive: station.isActive ?? false,
      ...station,
      applicationId: `mock-app-id-${Date.now()}`,
      rawApiKey: `mock-api-key-${Date.now()}-you-wont-see-this-again`,
    };
    mockGroundStations.push(newStation as GroundStation);
    return newStation;
  }

  try {
    return await apiClient.post<CreateGroundStationPayload, GroundStationWithApiKey>(API_PATH, station);
  } catch (error) {
    console.error('Error creating ground station:', error);
    throw error;
  }
}

export async function updateGroundStation(
  id: number, 
  payload: UpdateGroundStationPayload
): Promise<GroundStation> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const idx = mockGroundStations.findIndex((g) => g.id === id);
    if (idx !== -1) {
      mockGroundStations[idx] = { ...mockGroundStations[idx], ...payload };
    }
    return mockGroundStations[idx];
  }

  try {
    return await apiClient.patch<UpdateGroundStationPayload, GroundStation>(`${API_PATH}/${id}`, payload);
  } catch (error) {
    console.error(`Error updating ground station ${id}:`, error);
    throw error;
  }
}

export async function deleteGroundStation(id: number): Promise<{ success: boolean }> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const idx = mockGroundStations.findIndex((g) => g.id === id);
    if (idx !== -1) {
      mockGroundStations.splice(idx, 1);
      return { success: true };
    }
    return { success: false };
  }

  try {
    await apiClient.delete(`${API_PATH}/${id}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ground station ${id}:`, error);
    return { success: false };
  }
}

// health check endpoint
export interface GroundStationHealthResponse {
  id: number;
  name: string;
  isActive: boolean;
  lastUpdated: string;
  status: string;
  checkedAt: string;
  checkType: string;
}

export async function checkGroundStationHealth(id: number): Promise<GroundStationHealthResponse | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const station = mockGroundStations.find((g) => g.id === id);
    if (!station) return null;
    
    return {
      id: station.id,
      name: station.name,
      isActive: station.isActive,
      lastUpdated: new Date().toISOString(),
      status: station.isActive ? "Healthy" : "Unhealthy",
      checkedAt: new Date().toISOString(),
      checkType: "Mock Health Check"
    };
  }
  
  try {
    return await apiClient.get<GroundStationHealthResponse>(`${API_PATH}/${id}/health`);
  } catch (error) {
    console.error(`Error checking health of ground station ${id}:`, error);
    return null;
  }
}