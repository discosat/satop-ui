
export interface GroundStation {
  id: number;
  name: string;
  location: { latitude: number; longitude: number; altitude: number };
  httpUrl: string;
  createdAt: string;
  isActive: boolean;
}

export type GroundStationWithApiKey = GroundStation & {
  applicationId: string;
  rawApiKey: string;
};

export type CreateGroundStationPayload = Omit<GroundStation, 'id' | 'createdAt' | 'isActive'> & {
  isActive?: boolean;
};

export type UpdateGroundStationPayload = Partial<Omit<GroundStation, 'id' | 'createdAt' | 'isActive'>>;
