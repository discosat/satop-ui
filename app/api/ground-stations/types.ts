
export interface GroundStation {
  id: number;
  name: string;
  location: { latitude: number; longitude: number; altitude: number };
  createdAt: string;
  connected: boolean;
}

export type GroundStationWithApiKey = GroundStation & {
  applicationId: string;
  rawApiKey: string;
};

export type CreateGroundStationPayload = Omit<GroundStation, 'id' | 'createdAt' | 'connected'> & {
};

export type UpdateGroundStationPayload = Partial<Omit<GroundStation, 'id' | 'createdAt' | 'connected'>>;

export interface GroundStationHealthResponse {
  id: number;
  name: string;
  connected: boolean;
  lastUpdated: string;
  checkedAt: string;
}