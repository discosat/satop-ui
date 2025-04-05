"use client";

import { Satellite } from "react-sat-map";

import { SatelliteMap } from "./satellite-map";
import { OverpassCalendar } from "./overpass-calendar";

// TODO: We can request this Data from the API or otherwise the just straight up call the TLE API
const satellites: Satellite[] = [
  {
    name: "ISS (ZARYA)",
    tle: {
      line1:
        "1 25544U 98067A   24357.81415843  .00061122  00000+0  10662-2 0  9993",
      line2:
        "2 25544  51.6377 100.8061 0005268 355.1085 147.9826 15.50107458487805",
    },
  },
];

export default function Page() {
  return (
    <div className="relative w-full flex flex-row p-4 gap-4 flex-1">
      <OverpassCalendar satellites={satellites} />
      <SatelliteMap satellites={satellites} />
    </div>
  );
}
