"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Orbit, 
  Clock, 
  Satellite, 
  Navigation, 
  Gauge, 
  Globe,
  Timer,
  Activity
} from "lucide-react";
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

  // Calculate orbital period (approximation based on altitude)
  const orbitalPeriod = () => {
    const earthRadius = 6371; // km
    const mu = 398600.4418; // Earth's gravitational parameter (km³/s²)
    const a = earthRadius + info.altitude; // Semi-major axis
    const period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / mu);
    const minutes = Math.floor(period / 60);
    const seconds = Math.floor(period % 60);
    return `${minutes}m ${seconds}s`;
  };

  // Format coordinates for better readability
  const formatCoordinate = (value: number, isLatitude: boolean) => {
    const direction = isLatitude 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(4)}° ${direction}`;
  };

  return (
    <Card className="border-border bg-card/95 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <CardHeader className="pb-3 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base text-card-foreground">
            <div className="relative p-1.5 rounded-full bg-primary/10 border border-primary/20">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-75" />
              <Satellite size={16} className="text-primary relative z-10" />
            </div>
            <span className="truncate font-semibold">{name}</span>
          </CardTitle>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full border border-border/50">
            <Clock size={12} />
            <span className="font-mono">{formatTime(info.timestamp)}</span>
          </div>
          <div className="text-[10px] text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
            Live Tracking
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3 relative space-y-3">
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-2.5 rounded-lg border border-blue-500/20 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 font-medium">
              <Navigation size={10} />
              Altitude
            </div>
            <div className="text-sm font-semibold text-foreground">
              {info.altitude.toFixed(2)} km
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {(info.altitude * 0.621371).toFixed(2)} mi
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-2.5 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1 font-medium">
              <Gauge size={10} />
              Velocity
            </div>
            <div className="text-sm font-semibold text-foreground">
              {info.velocity.toFixed(2)} km/s
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {(info.velocity * 3600).toFixed(0)} km/h
            </div>
          </div>
        </div>
        
        {/* Position Data */}
        <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 font-semibold">
            <Globe size={12} className="text-green-500" />
            Current Position
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[10px] text-muted-foreground mb-0.5">Latitude</div>
              <div className="text-xs font-semibold text-foreground font-mono">
                {formatCoordinate(info.latitude, true)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground mb-0.5">Longitude</div>
              <div className="text-xs font-semibold text-foreground font-mono">
                {formatCoordinate(info.longitude, false)}
              </div>
            </div>
          </div>
        </div>

        {/* Orbital Information */}
        <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2 font-semibold">
            <Timer size={12} className="text-orange-500" />
            Orbital Period
          </div>
          <div className="text-sm font-semibold text-foreground">
            {orbitalPeriod()}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Time to complete one orbit
          </div>
        </div>

        {/* Activity Status */}
        <div className="flex items-center justify-between bg-green-500/10 p-2 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-1.5">
            <Activity size={12} className="text-green-500" />
            <span className="text-xs font-medium text-foreground">Status</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Active</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 pb-3 flex flex-col gap-3 border-t border-border/50 bg-muted/20">
        <ToggleGroup
          type="single"
          value={showOrbit}
          onValueChange={(val) => val && setShowOrbit(val)}
          size="sm"
          className="bg-background border border-border/50 rounded-md w-full"
        >
          <ToggleGroupItem 
            value="position" 
            className="text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1"
          >
            Position
          </ToggleGroupItem>
          <ToggleGroupItem 
            value="orbit" 
            className="text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground flex-1"
          >
            <Orbit className="h-3 w-3 mr-1" />
            Orbit
          </ToggleGroupItem>
        </ToggleGroup>
        
        <div className="flex items-center gap-2 w-full">
          <RefreshButton onClick={refreshPosition} className="flex-1" />
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 flex-1 bg-background hover:bg-accent hover:text-accent-foreground border-border"
            onClick={centerOnSatellite}
          >
            Center
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
