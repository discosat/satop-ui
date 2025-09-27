export interface GroundStation {
  id: number;
  name: string;
  // latitude, longitude, altitude in WGS84 for display convenience; backend stores GEOGRAPHY POINT(4326)
  location: { latitude: number; longitude: number; altitude: number };
  httpUrl: string;
  createdAt: string;
  isActive: boolean;
}

export const mockGroundStations: GroundStation[] = [
  {
    id: 1,
    name: "Svalbard Ground Station",
    location: { latitude: 78.2232, longitude: 15.6469, altitude: 72 },
    httpUrl: "http://svalbard.gs.example",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 2,
    name: "Vandenberg SFB",
    location: { latitude: 34.742, longitude: -120.5724, altitude: 110 },
    httpUrl: "http://vandenberg.gs.example",
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 3,
    name: "Perth Ground Station",
    location: { latitude: -31.9523, longitude: 115.8613, altitude: 20 },
    httpUrl: "http://perth.gs.example",
    createdAt: new Date().toISOString(),
    isActive: false,
  },
]; 