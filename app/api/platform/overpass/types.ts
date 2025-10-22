
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