import { mockGroundStations, GroundStation } from "./mock";

const API_URL = 'http://localhost:5111/api/v1/ground-stations';

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

export async function createGroundStation(station: Omit<GroundStation, 'id' | 'createdAt'>): Promise<GroundStation> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const newStation: GroundStation = {
      id: String(mockGroundStations.length + 1),
      ...station,
      createdAt: new Date().toISOString(),
    };
    mockGroundStations.push(newStation);
    return newStation;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(station),
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) throw new Error(`Failed to create ground station: ${response.statusText}`);
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

export async function deleteGroundStation(id: string): Promise<{ success: boolean }> {
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