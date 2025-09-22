"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Orbit, Clock, Satellite, Navigation, Gauge, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RefreshButton } from "@/components/refresh-button";

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
  refreshPosition,
  centerOnSatellite,
}: SatelliteInfoCardProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format the time for display - prevent hydration mismatch
  const formatTime = (date: Date) => {
    if (!isMounted) {
      // Return a consistent format for SSR
      return date.toISOString().substr(11, 8);
    }
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className="border-border bg-card/95 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden">
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <div className="relative p-1.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" />
              <Satellite size={16} className="text-primary relative z-10" />
            </div>
            {name}
          </CardTitle>
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full border border-border/50">
            <Clock size={12} />
            <span>{formatTime(info.timestamp)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 relative">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 font-medium">
              <Navigation size={10} />
              Altitude
            </div>
            <div className="text-sm font-semibold text-foreground">
              {info.altitude.toFixed(2)} km
            </div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 font-medium">
              <Gauge size={10} />
              Velocity
            </div>
            <div className="text-sm font-semibold text-foreground">
              {info.velocity.toFixed(2)} km/s
            </div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 font-medium">
              <MapPin size={10} />
              Latitude
            </div>
            <div className="text-sm font-semibold text-foreground">
              {info.latitude.toFixed(4)}°
            </div>
          </div>
          <div className="bg-secondary/50 p-3 rounded-lg border border-border/50 hover:bg-secondary/70 transition-colors">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 font-medium">
              <MapPin size={10} />
              Longitude
            </div>
            <div className="text-sm font-semibold text-foreground">
              {info.longitude.toFixed(4)}°
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-3 flex items-center justify-between border-t border-border/50 bg-muted/20">
        <ToggleGroup
          type="single"
          value={showOrbit}
          onValueChange={(val) => val && setShowOrbit(val)}
          size="sm"
          className="bg-background border border-border/50 rounded-md mt-2"
        >
          <ToggleGroupItem 
            value="position" 
            className="text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Position
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="orbit" 
            className="text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            <Orbit className="h-3 w-3 mr-1" />
            Orbit
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="flex items-center gap-2 mt-2">
          <RefreshButton onClick={refreshPosition} />
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 px-3 bg-background hover:bg-accent hover:text-accent-foreground border-border"
            onClick={centerOnSatellite}
          >
            Center
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
