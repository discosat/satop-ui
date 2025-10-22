import type { Overpass, OverpassQueryParams } from "./types";

// In-memory mock associations so UI can reflect changes when mocked
type MockOverpassAssociation = {
  startTime: string;
  endTime: string;
  associatedFlightPlan: NonNullable<Overpass['associatedFlightPlan']>;
};

const mockAssociations: MockOverpassAssociation[] = [];

export function addMockOverpassAssociation(association: MockOverpassAssociation): void {
  mockAssociations.push(association);
}

// Mock data for development/testing
export function getMockOverpassWindows(
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