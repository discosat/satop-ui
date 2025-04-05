"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Info, RefreshCw, Orbit, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface SatelliteInfoCardProps {
  name: string;
  info: {
    altitude: number;
    velocity: number;
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  showOrbit: string;
  setShowOrbit: (value: string) => void;
  isLoading: boolean;
  refreshPosition: () => void;
  centerOnSatellite: () => void;
}

export function SatelliteInfoCard({
  name,
  info,
  showOrbit,
  setShowOrbit,
  isLoading,
  refreshPosition,
  centerOnSatellite,
}: SatelliteInfoCardProps) {
  // Format the time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  // Format the date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Info size={18} />
          {name}
        </CardTitle>
        <CardDescription>Satellite Tracking Data</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <Clock size={14} />
            <span>{formatTime(info.timestamp)}</span>
            <span className="mx-1">·</span>
            <span>{formatDate(info.timestamp)}</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Altitude:</span>
              <span className="text-sm">{info.altitude.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Velocity:</span>
              <span className="text-sm">{info.velocity.toFixed(2)} km/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Latitude:</span>
              <span className="text-sm">{info.latitude.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Longitude:</span>
              <span className="text-sm">{info.longitude.toFixed(4)}°</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex flex-col gap-2">
        <div className="w-full flex justify-between">
          <ToggleGroup
            type="single"
            value={showOrbit}
            onValueChange={(val) => val && setShowOrbit(val)}
          >
            <ToggleGroupItem value="position" size="sm">
              Position
            </ToggleGroupItem>
            <ToggleGroupItem value="orbit" size="sm">
              <Orbit className="h-4 w-4 mr-1" />
              Orbit
            </ToggleGroupItem>
          </ToggleGroup>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshPosition}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <Button
          size="sm"
          variant="secondary"
          className="w-full"
          onClick={centerOnSatellite}
        >
          Center on Satellite
        </Button>
      </CardFooter>
    </Card>
  );
}
