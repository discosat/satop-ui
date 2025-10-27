import SatellitesTable from "./satellites-table";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";

export default async function Page() {
  const satellites = await getSatellites();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Satellites</h1>
          <p className="text-muted-foreground">
            View and manage satellite information including TLE data and orbital parameters.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between">
          <SearchForm />
          <ServerRefreshButton />
        </div>

        <SatellitesTable satellites={satellites} />
      </div>
    </div>
  );
}
