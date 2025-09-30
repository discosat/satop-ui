"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Download, RefreshCw, Info } from "lucide-react";
import { useState } from "react";
import type { Satellite } from "@/app/api/platform/satellites/satellite-service";
import { SatelliteDetailsModal } from "./satellite-details-modal";

export function SatelliteActions({ satellite }: { satellite: Satellite }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = () => {
    setDetailsOpen(true);
  };

  const handleDownloadTLE = () => {
    if (satellite.tle?.line1 && satellite.tle?.line2) {
      const tleData = `${satellite.name}\n${satellite.tle.line1}\n${satellite.tle.line2}`;
      const blob = new Blob([tleData], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${satellite.name.replace(/\s+/g, "_")}_TLE.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRefreshTLE = () => {
    // In a real application, this would trigger a TLE refresh
    console.log(`Refreshing TLE for satellite ${satellite.id}`);
    // You could implement a refresh function here

    
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="w-4 h-4 mr-2" />
            View details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {satellite.tle?.line1 && satellite.tle?.line2 && (
            <DropdownMenuItem onClick={handleDownloadTLE}>
              <Download className="w-4 h-4 mr-2" />
              Download TLE
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleRefreshTLE}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh TLE
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <Info className="w-4 h-4 mr-2" />
            Read-only mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SatelliteDetailsModal
        satellite={satellite}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </>
  );
}
