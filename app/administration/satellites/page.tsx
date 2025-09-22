import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SatellitesTable from "./satellites-table";
import { getSatellites } from "@/app/api/platform/satellites/satellite-service";
import { ServerRefreshButton } from "./server-refresh-button";
import { SearchForm } from "./search-form";

export const metadata: Metadata = {
  title: "Discosat: Satellites",
};

export default async function Page() {
  const satellites = await getSatellites();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Satellites</h1>
          <p className="text-muted-foreground">
            Manage and onboard satellites.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle>Registered Satellites</CardTitle>
          <CardDescription>
            View and manage satellite information including TLE data and orbital
            parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4 mt-2">
            <SearchForm />
            <ServerRefreshButton />
          </div>

          <SatellitesTable satellites={satellites} />
        </CardContent>
      </Card>
    </div>
  );
}
