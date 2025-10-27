import GroundStationsTable from "./ground-stations-table";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";
import { CreateGroundStationModal } from "./create-ground-station";

export default async function Page() {
  const groundStations = await getGroundStations();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Ground Stations</h1>
          <p className="text-muted-foreground">
            Manage and onboard ground station endpoints.
          </p>
        </div>
        <CreateGroundStationModal />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <SearchForm />
          <ServerRefreshButton />
        </div>

        <GroundStationsTable groundStations={groundStations} />
      </div>
    </div>
  );
}
