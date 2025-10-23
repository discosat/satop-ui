export type SatelliteStatus = "ACTIVE" | "INACTIVE";
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