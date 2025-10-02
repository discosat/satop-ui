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
  associatedFlightPlan?: {
    id: number;
    name: string;
    scheduledAt?: string;
    status: string;
    approverId?: string;
    approvalDate?: string;
  } | null;
  tleData?: {
    tleLine1: string;
    tleLine2: string;
    updateTime: string;
  } | null;
}

// In-memory mock associations so UI can reflect changes when MOCKED
type MockOverpassAssociation = {
  startTime: string;
  endTime: string;
  associatedFlightPlan: {
    id: number;
    name: string;
    scheduledAt?: string;
    status: string;
    approverId?: string;
    approvalDate?: string;
  };
};

const mockAssociations: MockOverpassAssociation[] = [];

export function addMockOverpassAssociation(association: MockOverpassAssociation): void {
  mockAssociations.push(association);
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

    const candidate: Overpass = {
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
      associatedFlightPlan: null,
      tleData: {
        tleLine1: `1 25544U 98067A   ${String(i).padStart(2, '0')}00000  .00016717  00000-0  10270-3 0  900${i}`,
        tleLine2: `2 25544  51.6445  97.9481 0007596  65.3937  72.2740 15.489${String(100 + i)}${i}    14`,
        updateTime: now.toISOString(),
      },
    };

    // If there is an explicit mock association overlapping this window, apply it
    const explicit = mockAssociations.find((a) => {
      const aStart = new Date(a.startTime).getTime();
      const aEnd = new Date(a.endTime).getTime();
      const cStart = new Date(candidate.startTime).getTime();
      const cEnd = new Date(candidate.endTime).getTime();
      return Math.max(aStart, cStart) <= Math.min(aEnd, cEnd);
    });
    if (explicit) {
      candidate.associatedFlightPlan = { ...explicit.associatedFlightPlan };
    } else if (Math.random() < 0.5) {
      // Otherwise, randomly associate some for variety
      candidate.associatedFlightPlan = {
        id: Math.floor(Math.random() * 1000) + 1,
        name: `Plan for pass ${i + 1}`,
        scheduledAt: startTime.toISOString(),
        status: 'ASSIGNED_TO_OVERPASS',
        approverId: undefined,
        approvalDate: undefined,
      };
    }

    mockOverpasses.push(candidate);
  }

  // Apply maxResults filter
  if (params?.maxResults) {
    return mockOverpasses.slice(0, params.maxResults);
  }

  return mockOverpasses;
}
