import { Metadata } from "next";
import { getUpcomingPassSpotlight } from "./get-upcoming-pass-spotlight";
import { UpcomingPassSpotlight } from "./upcoming-pass-spotlight";
import { getGroundStationHealth } from "./get-ground-station-health";
import { GroundStationHealthCard } from "./ground-station-health-card";
import { getOverpassQueueSnapshot } from "./get-overpass-queue";
import { OverpassQueueSnapshot } from "./overpass-queue-snapshot";
import { getFlightPlanActivityFeed } from "./get-flight-plan-activity-feed";
import { FlightPlanActivityFeed } from "./flight-plan-activity-feed";

export const metadata: Metadata = {
  title: "Discosat: Platform Overview",
  description:
    "Comprehensive satellite operations and flight planning platform",
};

export default async function Page() {
  const [spotlight, groundStationHealth, overpassQueue, flightPlanFeed] =
    await Promise.all([
      getUpcomingPassSpotlight(),
      getGroundStationHealth(),
      getOverpassQueueSnapshot(),
      getFlightPlanActivityFeed(),
    ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Home</h1>
          <p className="text-muted-foreground">
            Overview of satellite operations and platform status
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="space-y-6">
          <UpcomingPassSpotlight data={spotlight} />
        </div>
        <div className="space-y-6">
          <GroundStationHealthCard stations={groundStationHealth} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <OverpassQueueSnapshot data={overpassQueue} />
        <FlightPlanActivityFeed entries={flightPlanFeed} />
      </div>
    </div>
  );
}
