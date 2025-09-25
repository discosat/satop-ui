// Overpass service for calling into the overpass API

const API_URL = 'http://localhost:5111/api/v1/overpasses';

// Type definitions based on the C# DTOs
export interface Overpass {
  satelliteId: number;
  satelliteName: string;
  groundStationId: number;
  groundStationName: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  maxElevationTime: string; // ISO date string
  maxElevation: number;
  durationSeconds: number;
  startAzimuth: number;
  endAzimuth: number;
}

export interface OverpassCalculationRequest {
  satelliteId: number;
  groundStationId: number;
  startTime: Date;
  endTime: Date;
  minimumElevation: number; // defaults to 0.0, range 0-90
  maxResults?: number;
  minimumDurationSeconds?: number;
}

export interface OverpassQueryParams {
  startTime?: string; // ISO date string
  endTime?: string; // ISO date string
  minimumElevation?: number;
  maxResults?: number;
  minimumDuration?: number; // in seconds
}

export async function getOverpassWindows(
  satelliteId: number,
  groundStationId: number,
  params?: OverpassQueryParams
): Promise<Overpass[]> {

  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    // Return mock data for development
    return getMockOverpassWindows(satelliteId, groundStationId, params);
  }

  try {
    // Build query string
    const queryParams = new URLSearchParams();
    
    if (params?.startTime) {
      queryParams.append('startTime', params.startTime);
    }
    if (params?.endTime) {
      queryParams.append('endTime', params.endTime);
    }
    if (params?.minimumElevation !== undefined) {
      queryParams.append('minimumElevation', params.minimumElevation.toString());
    }
    if (params?.maxResults !== undefined) {
      queryParams.append('maxResults', params.maxResults.toString());
    }
    if (params?.minimumDuration !== undefined) {
      queryParams.append('minimumDuration', params.minimumDuration.toString());
    }

    const url = `${API_URL}/satellite/${satelliteId}/groundstation/${groundStationId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } 
    });

    if (response.status === 404) {
      console.log("No overpass windows found on the server, returning empty list.");
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch overpass windows: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching overpass windows:", error);
    return [];
  }
}

// Mock data for development/testing
function getMockOverpassWindows(
  satelliteId: number, 
  groundStationId: number, 
  params?: OverpassQueryParams
): Overpass[] {
  // Generate some mock overpass data
  const now = new Date();
  const mockOverpasses: Overpass[] = [];

  // Create 5 mock overpasses over the next 7 days
  for (let i = 0; i < 5; i++) {
    const startTime = new Date(now.getTime() + (i * 24 + Math.random() * 12) * 60 * 60 * 1000);
    const duration = Math.floor(Math.random() * 600) + 300; // 5-15 minutes
    const endTime = new Date(startTime.getTime() + duration * 1000);
    const maxElevation = Math.random() * 70 + 10; // 10-80 degrees
    const maxElevationTime = new Date(startTime.getTime() + (duration / 2) * 1000);

    // Apply filters if provided
    if (params?.minimumElevation && maxElevation < params.minimumElevation) {
      continue;
    }
    if (params?.minimumDuration && duration < params.minimumDuration) {
      continue;
    }

    mockOverpasses.push({
      satelliteId,
      satelliteName: `Satellite ${satelliteId}`,
      groundStationId,
      groundStationName: `Ground Station ${groundStationId}`,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      maxElevationTime: maxElevationTime.toISOString(),
      maxElevation,
      durationSeconds: duration,
      startAzimuth: Math.random() * 360,
      endAzimuth: Math.random() * 360,
    });
  }

  // Apply maxResults filter
  if (params?.maxResults) {
    return mockOverpasses.slice(0, params.maxResults);
  }

  return mockOverpasses;
}
