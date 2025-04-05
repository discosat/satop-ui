"use client";

import React, { useState, useEffect } from "react";
import * as satellite from "satellite.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Clock, Calendar, MapPin, RefreshCw, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Satellite } from "react-sat-map";

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
}

export function OverpassCalendar({ satellites }: OverpassCalendarProps) {
  const [overpasses, setOverpasses] = useState<Overpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  const issTLE = satellites[0];

  // Default location (Aarhus)
  const observerLocation: ObserverLocation = {
    latitude: 56.162937,
    longitude: 10.203921,
    height: 0.01, // km above sea level (approximation)
  };

  // Convert degrees to radians
  const deg2rad = (degrees: number): number => (degrees * Math.PI) / 180;

  // Convert radians to degrees
  const rad2deg = (radians: number): number => (radians * 180) / Math.PI;

  // Check if the satellite is visible (elevation > 5 degrees)
  const isVisible = (elevation: number): boolean => {
    return elevation >= 5; // Minimum elevation of 5 degrees
  };

  const calculateOverpasses = (): void => {
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
      setIsRefreshing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Refresh overpass calculations
  const refreshCalculations = (): void => {
    setIsRefreshing(true);
    setTimeout(calculateOverpasses, 100);
  };

  useEffect(() => {
    setIsMounted(true);
    calculateOverpasses();
  }, []);

  // Format date and time - fixed to prevent hydration mismatch
  const formatDateTime = (date: Date): string => {
    // Skip formatting during server render
    if (!isMounted) return "";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Format time only - fixed to prevent hydration mismatch
  const formatTime = (date: Date): string => {
    // Skip formatting during server render
    if (!isMounted) return "";

    return date.toLocaleTimeString("en-US", {
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

  // Determine badge variant based on elevation
  const getElevationVariant = (
    elevation: number
  ): "default" | "secondary" | "outline" => {
    if (elevation > 45) return "default";
    if (elevation > 25) return "secondary";
    return "outline";
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
        <div className="p-4 border border-yellow-200 bg-yellow-50/50 text-yellow-800 rounded-md">
          <p>No ISS overpasses found for Aarhus in the next 24 hours.</p>
        </div>
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
      <ScrollArea className="">
        <div className="space-y-3 p-1">
          {overpasses.map((pass, index) => {
            const isNow = isHappeningNow(pass.start, pass.end);
            return (
              <Card
                key={index}
                className={`border-l-4 ${
                  isNow ? "border-l-primary" : "border-l-muted"
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-1">
                      {isNow && (
                        <ArrowUpRight className="h-4 w-4 text-primary" />
                      )}
                      Overpass #{index + 1}
                    </CardTitle>
                    <Badge variant={getElevationVariant(pass.maxElevation)}>
                      {pass.maxElevation.toFixed(1)}° max
                    </Badge>
                  </div>
                  <CardDescription>
                    {getDuration(pass.start.getTime(), pass.end.getTime())}{" "}
                    minutes duration
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-muted/50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Start
                      </p>
                      <p className="font-medium text-sm">
                        {formatTime(pass.start)}
                      </p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        End
                      </p>
                      <p className="font-medium text-sm">
                        {formatTime(pass.end)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Peak elevation at {formatDateTime(pass.maxElevationTime)}
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
    <Card className="w-96 shadow-md mr-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              ISS Overpasses
            </CardTitle>
            <CardDescription>Next 24 hours from now</CardDescription>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={refreshCalculations}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 pt-3">
        <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            Aarhus ({observerLocation.latitude.toFixed(2)}°N,{" "}
            {observerLocation.longitude.toFixed(2)}°E)
          </span>
        </div>
        {renderContent()}
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground">
        <p>Minimum elevation: 5° above horizon</p>
      </CardFooter>
    </Card>
  );
}
