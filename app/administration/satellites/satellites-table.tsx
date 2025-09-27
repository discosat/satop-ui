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

import { SatelliteActions } from "./actions";
import {
  Satellite as SatelliteIcon,
  Hash,
  Clock,
  Calendar,
  Activity,
  Orbit,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Satellite, SatelliteStatus } from "@/app/api/platform/satellites/satellite-service";

interface SatellitesTableProps {
  satellites: Satellite[];
}

const getStatusColor = (status: SatelliteStatus) => {
  switch (status) {
    case SatelliteStatus.Active:
      return "bg-green-200 text-green-800 hover:bg-green-200";
    case SatelliteStatus.Inactive:
      return "bg-gray-200 text-gray-800 hover:bg-gray-200";
    case SatelliteStatus.UnderMaintenance:
      return "bg-yellow-200 text-yellow-800 hover:bg-yellow-200";
    case SatelliteStatus.Decommissioned:
      return "bg-red-200 text-red-800 hover:bg-red-200";
    case SatelliteStatus.Launching:
      return "bg-blue-200 text-blue-800 hover:bg-blue-200";
    default:
      return "bg-gray-200 text-gray-800 hover:bg-gray-200";
  }
};

const getStatusIcon = (status: SatelliteStatus) => {
  switch (status) {
    case SatelliteStatus.Active:
      return <Activity className="w-3 h-3" />;
    case SatelliteStatus.UnderMaintenance:
      return <RefreshCw className="w-3 h-3" />;
    case SatelliteStatus.Launching:
      return <Orbit className="w-3 h-3" />;
    default:
      return <Activity className="w-3 h-3" />;
  }
};

export default function SatellitesTable({ satellites }: SatellitesTableProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const filtered = query
    ? satellites.filter((sat) => {
        const q = query.toLowerCase();
        return (
          sat.name.toLowerCase().includes(q) ||
          sat.noradId.toLowerCase().includes(q)
        );
      })
    : satellites;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>NORAD ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last TLE Update</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                No satellites found
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((sat) => (
              <TableRow key={sat.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <SatelliteIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium">{sat.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {sat.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{sat.noradId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(sat.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(sat.status)}
                      {sat.status}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  {sat.lastUpdate ? (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">
                          {formatDate(sat.lastUpdate)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatRelativeTime(sat.lastUpdate)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm">{formatDate(sat.createdAt)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(sat.createdAt)}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <SatelliteActions satellite={sat} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
