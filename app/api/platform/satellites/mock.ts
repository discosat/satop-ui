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
  {
    id: 2,
    name: "Hubble Space Telescope",
    noradId: "20580",
    status: 0,
    tle: {
      line1: "1 20580U 90037B   24123.45678901  .00001234  00000-0  12345-4 0  9991",
      line2: "2 20580  28.4685 123.4567 0002123 123.4567 234.5678 15.09345678901234",
    },
    lastUpdate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
  },
  {
    id: 3,
    name: "NOAA-19",
    noradId: "33591",
    status: 0,
    tle: {
      line1: "1 33591U 09005A   24123.45678901  .00000234  00000-0  12345-5 0  9992",
      line2: "2 33591  99.1234 123.4567 0012345 123.4567 234.5678 14.12345678901234",
    },
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
  },
  {
    id: 4,
    name: "Starlink-1234",
    noradId: "44567",
    status: 0,
    tle: {
      line1: "1 44567U 19074A   24123.45678901  .00002345  00000-0  12345-4 0  9993",
      line2: "2 44567  53.0234 123.4567 0001456 123.4567 234.5678 15.06345678901234",
    },
    lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
];
