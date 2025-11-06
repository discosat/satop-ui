import FlightPlansTable from "./flight-table";
import { getFlightPlans } from "@/app/api/flight/flight-plan-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import Protected from "@/components/protected";

export default async function Page({}) {

  const flightPlans = await getFlightPlans();
  const satellites = await getSatellites();
  const groundStations = await getGroundStations();

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Flight Planning</h1>
          <p className="text-muted-foreground">
            Create and manage satellite command sequences for upcoming overpasses.
          </p>
        </div>
        <div>
          <Protected requireOperator>
            <Link href="/platform/flight/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create new plan
              </Button>
            </Link>
          </Protected>
        </div>
      </div>

      <div className="space-y-4">
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

        <FlightPlansTable
          flightPlans={flightPlans}
          satellites={satellites}
          groundStations={groundStations}
        />
      </div>
    </div>
  );
}
