import { GroundStation } from "./types";



export const mockGroundStations: GroundStation[] = [
  {
    id: 1,
    name: "Svalbard Ground Station",
    location: { latitude: 78.2232, longitude: 15.6469, altitude: 72 },
    createdAt: new Date().toISOString(),
    connected: true,
  },
  {
    id: 2,
    name: "Vandenberg SFB",
    location: { latitude: 34.742, longitude: -120.5724, altitude: 110 },
    createdAt: new Date().toISOString(),
    connected: true,
  },
  {
    id: 3,
    name: "Perth Ground Station",
    location: { latitude: -31.9523, longitude: 115.8613, altitude: 20 },
    createdAt: new Date().toISOString(),
    connected: false,
  },
  {
    id: 4,
    name: "Kiruna Ground Station",
    location: { latitude: 67.8558, longitude: 20.2253, altitude: 390 },
    createdAt: new Date().toISOString(),
    connected: true,
  },
]; 