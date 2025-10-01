import { mockGroundStations, GroundStation } from "./mock";

export type GroundStationWithApiKey = GroundStation & {
  applicationId: string;
  rawApiKey: string;
};

export type CreateGroundStationPayload = Omit<GroundStation, 'id' | 'createdAt' | 'isActive'> & {
  isActive?: boolean;
};

const API_URL = 'http://localhost:7890/api/v1/ground-stations';

export async function getGroundStations(): Promise<GroundStation[]> {

  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockGroundStations;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });
    if (response.status === 404) {
      console.log("No flight plans found on the server, returning empty list.");
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight plans: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
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
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(station),
    });
    
    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Failed to create ground station:', response.statusText, errorBody);
        throw new Error(`Failed to create ground station: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating ground station:', error);
    throw error;
  }
}

export async function updateGroundStation(updated: GroundStation): Promise<GroundStation> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
  const idx = mockGroundStations.findIndex((g) => g.id === updated.id);
  if (idx !== -1) {
    mockGroundStations[idx] = { ...updated };
  }
  return updated;
}
  try {
    const response = await fetch(`${API_URL}/${updated.id}`, {
      //TODO: make this a real patch :( its not right now
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updated),
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) throw new Error(`Failed to update ground station: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Error updating ground station ${updated.id}:`, error);
    return updated; // Return original on error
  }
}

export async function deleteGroundStation(id: number): Promise<{ success: boolean }> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const idx = mockGroundStations.findIndex((g) => g.id === id);
    if (idx !== -1) {
      mockGroundStations.splice(idx, 1);
      return { success: true };
    }
  }
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) throw new Error(`Failed to delete ground station: ${response.statusText}`);
    return { success: true };
  } catch (error) {
    console.error(`Error deleting ground station ${id}:`, error);
  }
  return { success: false };
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
    const response = await fetch(`${API_URL}/${id}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Don't cache health checks as they should be real-time
    });
    
    if (!response.ok) {
      throw new Error(`Failed to check ground station health: ${response.statusText}`);
    }
    
    const healthData = await response.json();
    return healthData;
  } catch (error) {
    console.error(`Error checking health of ground station ${id}:`, error);
    return null;
  }
}