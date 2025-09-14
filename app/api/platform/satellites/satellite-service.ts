import { mockSatellites, Satellite } from "./mock";

const API_URL = 'http://localhost:5111/api/v1/satellites';

export async function getSatellites(): Promise<Satellite[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockSatellites;
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
      console.log("No satellites found on the server, returning empty list.");
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch satellites: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching satellites:", error);
    return [];
  }
}

export async function getSatelliteById(id: string): Promise<Satellite | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockSatellites.find(sat => sat.id === id) || null;
  }

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch satellite: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching satellite ${id}:`, error);
    return null;
  }
}

