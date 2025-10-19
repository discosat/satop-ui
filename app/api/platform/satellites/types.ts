export const SatelliteStatus = {
  Active: 0,
  Inactive: 1,
  Decommissioned: 2,
  UnderMaintenance: 3,
  Launching: 4,
} as const;

export type SatelliteStatus = typeof SatelliteStatus[keyof typeof SatelliteStatus];

export interface Tle {
  line1: string;
  line2: string;
}

export interface Satellite {
  id: number;
  name: string;
  noradId: string;
  status: SatelliteStatus;
  tle: Tle
  createdAt: string;
  lastUpdate: string;
}