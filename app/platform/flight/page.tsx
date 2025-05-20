import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import FlightPlansTable from "./flight-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFlightPlans } from "@/app/api/platform/flight/flight-plan-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";

export default async function Page({

  
}) {
  const flightPlans = await getFlightPlans();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Flight planning</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create new plan
        </Button>
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
          <div className="flex justify-between mb-4 mt-2">
            <SearchForm />
            <ServerRefreshButton />
          </div>

          <FlightPlansTable flightPlans={flightPlans} />
        </CardContent>
      </Card>
    </div>
  );
}
