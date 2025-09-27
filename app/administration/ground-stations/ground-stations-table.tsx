"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MapPin, Link as LinkIcon, Radio, Clock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { GroundStationActions } from "./actions";
import Link from "next/link";

interface GroundStationsTableProps {
  groundStations: GroundStation[];
}

export default function GroundStationsTable({
  groundStations,
}: GroundStationsTableProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const filtered = query
    ? groundStations.filter((gs) => {
        const q = query.toLowerCase();
        return (
          gs.name.toLowerCase().includes(q) ||
          gs.httpUrl.toLowerCase().includes(q) ||
          `${gs.location.latitude.toFixed(4)}, ${gs.location.longitude.toFixed(
            4
          )}, ${gs.location.altitude}m`
            .toLowerCase()
            .includes(q)
        );
      })
    : groundStations;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>HTTP URL</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No ground stations found
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((gs) => (
              <TableRow key={gs.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-green-600" />
                    {gs.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <Link
                      href={`https://www.google.com/maps?q=${gs.location.latitude},${gs.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {gs.location.latitude}, {gs.location.longitude} ({gs.location.altitude}m)
                    </Link>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate max-w-[260px]">
                      {gs.httpUrl}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatDate(gs.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {gs.isActive ? (
                    <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-200 text-gray-800 hover:bg-gray-200">
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <GroundStationActions station={gs} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}