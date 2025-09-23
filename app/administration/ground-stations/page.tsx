import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GroundStationsTable from "./ground-stations-table";
import { getGroundStations } from "@/app/api/platform/ground-stations/ground-station-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";
import { CreateGroundStationModal } from "./create-ground-station";

export default async function Page() {
  const groundStations = await getGroundStations();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Ground stations</h1>
          <p className="text-muted-foreground">
            Manage and onboard ground stations.
          </p>
        </div>
        <CreateGroundStationModal />
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Registered Ground Stations</CardTitle>
          <CardDescription>
            Manage and onboard ground station endpoints.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4 mt-2">
            <SearchForm />
            <ServerRefreshButton />
          </div>

          <GroundStationsTable groundStations={groundStations} />
        </CardContent>
      </Card>
    </div>
  );
}
