"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Satellite as SatelliteIcon,
  Clock,
  Activity,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { Satellite, SatelliteStatus } from "@/app/api/satellites/types";

interface SatelliteDetailsModalProps {
  satellite: Satellite;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusColor = (status: SatelliteStatus) => {
  switch (status) {
    case "ACTIVE" :
      return "bg-green-200 text-green-800 hover:bg-green-200";
    case "INACTIVE":
      return "bg-gray-200 text-gray-800 hover:bg-gray-200";
    default:
      return "bg-gray-200 text-gray-800 hover:bg-gray-200";
  }
};

export function SatelliteDetailsModal({
  satellite,
  open,
  onOpenChange,
}: SatelliteDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "full",
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
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTLE = () => {
    if (satellite.tle.line1 && satellite.tle.line2) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SatelliteIcon className="w-5 h-5 text-blue-600" />
            {satellite.name}
          </DialogTitle>
          <DialogDescription>
            Detailed information about satellite {satellite.noradId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Satellite ID
                </label>
                <p className="text-sm">{satellite.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  NORAD ID
                </label>
                <p className="text-sm font-mono">{satellite.noradId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div className="mt-1">
                  <Badge className={getStatusColor(satellite.status)}>
                    <Activity className="w-3 h-3 mr-1" />
                    {satellite.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created
                </label>
                <p className="text-sm">{formatDate(satellite.createdAt)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(satellite.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* TLE Data */}
          {satellite.tle.line1 && satellite.tle.line2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Two-Line Element (TLE) Data
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${satellite.tle.line1}\n${satellite.tle.line2}`
                      )
                    }
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadTLE}>
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Line 1
                  </label>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                    {satellite.tle.line1}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Line 2
                  </label>
                  <div className="bg-muted p-3 rounded-md font-mono text-sm break-all">
                    {satellite.tle.line2}
                  </div>
                </div>
              </div>

              {satellite.lastUpdate && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last TLE Update
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">
                      {formatDate(satellite.lastUpdate)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      ({formatRelativeTime(satellite.lastUpdate)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
