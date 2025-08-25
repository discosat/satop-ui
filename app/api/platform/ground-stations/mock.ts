export interface GroundStation {
  id: string;
  name: string;
  // latitude, longitude in WGS84 for display convenience; backend stores GEOGRAPHY POINT(4326)
  location: { latitude: number; longitude: number };
  websocket_url: string;
  created_at: string;
  is_active: boolean;
}

export const mockGroundStations: GroundStation[] = [
  {
    id: "1",
    name: "Svalbard Ground Station",
    location: { latitude: 78.2232, longitude: 15.6469 },
    websocket_url: "wss://svalbard.gs.example/ws",
    created_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: "2",
    name: "Vandenberg SFB",
    location: { latitude: 34.742, longitude: -120.5724 },
    websocket_url: "wss://vandenberg.gs.example/ws",
    created_at: new Date().toISOString(),
    is_active: true,
  },
  {
    id: "3",
    name: "Perth Ground Station",
    location: { latitude: -31.9523, longitude: 115.8613 },
    websocket_url: "wss://perth.gs.example/ws",
    created_at: new Date().toISOString(),
    is_active: false,
  },
]; 