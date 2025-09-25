import { type Satellite,   } from "./satellite-service";


export const mockSatellites: Satellite[] = [
  {
    id: 1,
    name: "ISS (ZARYA)",
    noradId: "25544",
    status: 0,
    tle: {
      line1: "1 25544U 98067A   24123.45678901  .00012345  00000-0  12345-4 0  9990",
      line2: "2 25544  51.6416 123.4567 0001234 123.4567 234.5678 15.12345678901234",
    },
    lastUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
  },
];
