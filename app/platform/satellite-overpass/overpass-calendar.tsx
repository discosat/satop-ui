"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import * as satellite from "satellite.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Clock, Calendar, MapPin, ArrowUpRight, Satellite as SatelliteIcon, Info, Eye } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Satellite } from "react-sat-map";
import { RefreshButton } from "@/components/refresh-button";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";

interface Overpass {
  start: Date;
  end: Date;
  maxElevation: number;
  maxElevationTime: Date;
}

interface ObserverLocation {
  latitude: number;
  longitude: number;
  height: number;
}

interface OverpassCalendarProps {
  satellites: Satellite[];
  groundStation?: GroundStation | null;
}

export function OverpassCalendar({ 
  satellites, 
  groundStation
}: OverpassCalendarProps) {
  const [overpasses, setOverpasses] = useState<Overpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  //const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const issTLE = satellites[0];

  // Use selected ground station location or default to Aarhus
  const observerLocation: ObserverLocation = useMemo(() => ({
    latitude: groundStation?.location.latitude ?? 56.162937,
    longitude: groundStation?.location.longitude ?? 10.203921,
    height: 0.01, // km above sea level (approximation)
  }), [groundStation]);

  // Convert degrees to radians
  const deg2rad = (degrees: number): number => (degrees * Math.PI) / 180;

  // Convert radians to degrees
  const rad2deg = (radians: number): number => (radians * 180) / Math.PI;

  // Check if the satellite is visible (elevation > 5 degrees)
  const isVisible = (elevation: number): boolean => {
    return elevation >= 5; // Minimum elevation of 5 degrees
  };

  const calculateOverpasses = useCallback((): void => {
    try {
      // Parse the TLE data
      const satrec = satellite.twoline2satrec(
        issTLE.tle.line1,
        issTLE.tle.line2
      );

      if (satrec.error) {
        throw new Error(`Error parsing TLE: ${satrec.error}`);
      }

      // Observer geodetic coordinates
      const observerGd = {
        longitude: deg2rad(observerLocation.longitude),
        latitude: deg2rad(observerLocation.latitude),
        height: observerLocation.height,
      };

      const foundOverpasses: Overpass[] = [];
      let isInOverpass = false;
      let currentOverpass: Overpass | null = null;

      // Calculate positions for the next 24 hours in 1-minute intervals
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

      for (
        let date = new Date(startDate);
        date < endDate;
        date = new Date(date.getTime() + 60 * 1000)
      ) {
        // Get satellite position
        const positionAndVelocity = satellite.propagate(satrec, date);

        if (positionAndVelocity.position && positionAndVelocity.velocity) {
          if (typeof positionAndVelocity.position === "boolean") {
            continue; // Skip if position is not available
          }
          // Get the satellite's position in ECEF coordinates

          const gmst = satellite.gstime(date);
          const positionEcf = satellite.eciToEcf(
            positionAndVelocity.position,
            gmst
          );

          // Get look angles (azimuth, elevation, range)
          const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

          // Check if satellite is visible
          const visible = isVisible(rad2deg(lookAngles.elevation));

          if (visible && !isInOverpass) {
            // Start of an overpass
            isInOverpass = true;
            currentOverpass = {
              start: new Date(date),
              end: new Date(date), // Initialize with a default that will be updated later
              maxElevation: rad2deg(lookAngles.elevation),
              maxElevationTime: new Date(date),
            };
          } else if (visible && isInOverpass && currentOverpass) {
            // During an overpass, update maximum elevation
            if (rad2deg(lookAngles.elevation) > currentOverpass.maxElevation) {
              currentOverpass.maxElevation = rad2deg(lookAngles.elevation);
              currentOverpass.maxElevationTime = new Date(date);
            }
          } else if (!visible && isInOverpass && currentOverpass) {
            // End of an overpass
            isInOverpass = false;
            currentOverpass.end = new Date(date);
            foundOverpasses.push({ ...currentOverpass });
            currentOverpass = null;
          }
        }
      }

      // If we're still in an overpass at the end of the calculation period
      if (isInOverpass && currentOverpass) {
        currentOverpass.end = new Date(endDate);
        foundOverpasses.push({ ...currentOverpass });
      }

      setOverpasses(foundOverpasses);
      setLoading(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    }
  }, [issTLE, observerLocation]);

  useEffect(() => {
    setIsMounted(true);
    calculateOverpasses();
  }, [calculateOverpasses]);

  // Format time only - fixed to prevent hydration mismatch
  const formatTime = (date: Date): string => {
    // Skip formatting during server render
    if (!isMounted) return "";

    return date.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Calculate duration in minutes
  const getDuration = (start: number, end: number): number => {
    return Math.round((end - start) / (60 * 1000));
  };

  // Check if overpass is happening now
  const isHappeningNow = (start: Date, end: Date): boolean => {
    const now = new Date();
    return now >= start && now <= end;
  };

  // Determine pass quality based on elevation
  const getPassQuality = (elevation: number): { quality: string; variant: "default" | "secondary" | "outline"; color: string } => {
    if (elevation >= 60) return { quality: "Excellent", variant: "default", color: "text-green-700 bg-green-100 border-green-200" };
    if (elevation >= 40) return { quality: "Great", variant: "default", color: "text-blue-700 bg-blue-100 border-blue-200" };
    if (elevation >= 25) return { quality: "Good", variant: "secondary", color: "text-orange-700 bg-orange-100 border-orange-200" };
    if (elevation >= 15) return { quality: "Fair", variant: "outline", color: "text-yellow-700 bg-yellow-100 border-yellow-200" };
    return { quality: "Poor", variant: "outline", color: "text-red-700 bg-red-100 border-red-200" };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4 p-1">
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="w-full h-28 rounded-md" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 border border-destructive/50 bg-destructive/10 rounded-md text-destructive">
          <p>Error: {error}</p>
        </div>
      );
    }

    if (overpasses.length === 0) {
      return (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="relative">
                <SatelliteIcon className="h-12 w-12 text-muted-foreground/40" />
                <Eye className="h-4 w-4 absolute -bottom-1 -right-1 text-muted-foreground/60 bg-background rounded-full p-0.5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-muted-foreground">
                  No visible passes found
                </h3>
                <p className="text-xs text-muted-foreground/80 max-w-xs">
                  The ISS won&apos;t be visible from <span className="font-medium">{groundStation?.name || 'Aarhus'}</span> in the next 24 hours above 5° elevation.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-full">
                <Info className="h-3 w-3" />
                <span>Try checking again later</span>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Don't render actual content until client-side hydration is complete
    if (!isMounted) {
      return (
        <div className="space-y-4 p-1">
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="w-full h-28 rounded-md" />
          <Skeleton className="w-full h-28 rounded-md" />
        </div>
      );
    }

    return (
      <ScrollArea className="h-full w-full">
        <div className="space-y-3 p-1">
          {overpasses.map((pass, index) => {
            const isNow = isHappeningNow(pass.start, pass.end);
            const passQuality = getPassQuality(pass.maxElevation);
            const duration = getDuration(pass.start.getTime(), pass.end.getTime());
            
            return (
              <Card
                key={index}
                className={`transition-all hover:shadow-md ${
                  isNow ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Left side - Time window */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {isNow && (
                          <ArrowUpRight className="h-4 w-4 text-primary" />
                        )}
                        <div className="text-sm font-medium">
                          Pass #{index + 1}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-mono">
                            {formatTime(pass.start)} - {formatTime(pass.end)}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          ({duration} min)
                        </div>
                      </div>
                    </div>

                    {/* Right side - Elevation and quality */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {pass.maxElevation.toFixed(1)}° max
                        </div>
                        <div className="text-xs text-muted-foreground">
                          at {formatTime(pass.maxElevationTime)}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${passQuality.color} border font-medium`}
                      >
                        {passQuality.quality}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Card className="w-full h-full shadow-md flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              ISS Overpasses
            </CardTitle>
            <CardDescription>Next 24 hours from now</CardDescription>
          </div>
          <RefreshButton
            onClick={() => {
              calculateOverpasses();
            }}
          />
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 pt-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground flex-shrink-0">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {groundStation?.name || 'Aarhus'} ({observerLocation.latitude.toFixed(2)}°N,{" "}
            {observerLocation.longitude.toFixed(2)}°E)
          </span>
        </div>
        <div className="flex-1 min-h-0">
          {renderContent()}
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground flex-shrink-0">
        <p>Minimum elevation: 5° above horizon</p>
      </CardFooter>
    </Card>
  );
}
