import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FlightPlansTable from "./flight-table";
import { getFlightPlans } from "@/app/api/platform/flight/flight-plan-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { me } from "@/app/actions/me";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSatellites } from "@/app/api/platform/satellites/satellite-service";
import { getGroundStations } from "@/app/api/platform/ground-stations/ground-station-service";

export default async function Page({}) {
  const session = await me();
  if (!session) {
    redirect("/login");
  }

  const flightPlans = await getFlightPlans();
  const satellites = await getSatellites();
  const groundStations = await getGroundStations();

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Flight planning</h1>
          <p className="text-muted-foreground">
            Create and manage satellite command sequences for upcoming
            overpasses.
          </p>
        </div>
        <div>
          <Link href="/platform/flight/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create new plan
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Scheduled Flight Plans</CardTitle>
          <CardDescription>
            View, update and approve pending satellite command sequences
            awaiting transmission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 mt-2">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-4">
                <SearchForm
                  flightPlans={flightPlans}
                  satellites={satellites}
                  groundStations={groundStations}
                />
              </div>
              <ServerRefreshButton />
            </div>
          </div>

          <FlightPlansTable
            flightPlans={flightPlans}
            satellites={satellites}
            groundStations={groundStations}
          />
        </CardContent>
      </Card>
    </div>
  );
}
