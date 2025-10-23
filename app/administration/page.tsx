import { Metadata } from "next";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { Satellite } from "@/app/api/satellites/types";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { Satellite as SatelliteIcon, Radio, MapPin, Hash } from "lucide-react";
import { getUsers } from "@/app/api/users/users-service";
import { User } from "@/app/api/users/types";

export const metadata: Metadata = {
  title: "Discosat: Administration Overview",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default async function Page() {
  const [satellites, groundStations, users]: [Satellite[], GroundStation[], User[]] =
    await Promise.all([getSatellites(), getGroundStations(), getUsers()]);

  const totalSatellites = satellites.length;
  const totalGroundStations = groundStations.length;
  const totalUsers = users.length;

  const recentSatellites = [...satellites]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);
  const recentGroundStations = [...groundStations]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Administration</h1>
        <p className="text-muted-foreground">
          Overview of satellites, ground stations, and quick links.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Satellites</CardTitle>
            <CardDescription>Total registered satellites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-bold">{totalSatellites}</div>
              <Link
                href="/administration/satellites"
                className="text-sm underline"
              >
                Manage
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Ground stations</CardTitle>
            <CardDescription>Total registered ground stations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-bold">{totalGroundStations}</div>
              <Link
                href="/administration/ground-stations"
                className="text-sm underline"
              >
                Manage
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage users and applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-4xl font-bold">{totalUsers}</div>
              <Link href="/administration/users" className="text-sm underline">
                Manage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle>Recent satellites</CardTitle>
            <CardDescription>
              Newest satellites by creation date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>NORAD ID</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSatellites.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No satellites
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSatellites.map((sat) => (
                    <TableRow key={sat.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <SatelliteIcon className="w-4 h-4 text-blue-600" />
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sat.name}</span>
                            <Badge variant="secondary">ID {sat.id}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-sm">
                            {sat.noradId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(sat.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-3 text-right">
              <Link
                href="/administration/satellites"
                className="text-sm underline"
              >
                View all satellites
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <CardTitle>Recent ground stations</CardTitle>
            <CardDescription>
              Newest ground stations by creation date
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentGroundStations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No ground stations
                    </TableCell>
                  </TableRow>
                ) : (
                  recentGroundStations.map((gs) => (
                    <TableRow key={gs.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{gs.name}</span>
                          {gs.connected ? (
                            <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>
                            {gs.location.latitude}, {gs.location.longitude} ({gs.location.altitude}m)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(gs.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="mt-3 text-right">
              <Link
                href="/administration/ground-stations"
                className="text-sm underline"
              >
                View all ground stations
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
