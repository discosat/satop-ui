"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getFlightPlanById } from "@/app/api/flight/flight-plan-service";
import { getSatellites } from "@/app/api/satellites/satellite-service";
import { getGroundStations } from "@/app/api/ground-stations/ground-station-service";
import type { FlightPlan } from "@/app/api/flight/types";
import type { Satellite } from "@/app/api/satellites/types";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { AssignOverpassClient } from "./assign-overpass-client";
import { AssignOverpassSkeleton } from "./assign-overpass-skeleton";
import { Satellite as SatMapSatellite } from "react-sat-map";
import FlightPlanSteps from "@/app/platform/flight/components/flight-plan-steps";

export default function AssignOverpassPage() {
  const params = useParams();
  const router = useRouter();
  const [flightPlan, setFlightPlan] = useState<FlightPlan | null>(null);
  const [satellite, setSatellite] = useState<Satellite | null>(null);
  const [groundStation, setGroundStation] = useState<GroundStation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const id = typeof params.id === "string" ? params.id : "";

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      if (!id) {
        console.warn("[AssignOverpassPage] No flight plan ID provided");
        return;
      }
      
      console.log("[AssignOverpassPage] Loading flight plan:", id);
      setIsLoading(true);
      
      try {
        const [plan, sats, stations] = await Promise.all([
          getFlightPlanById(Number(id)),
          getSatellites(),
          getGroundStations(),
        ]);

        console.log("[AssignOverpassPage] Data loaded:", {
          flightPlan: plan,
          satellitesCount: sats.length,
          groundStationsCount: stations.length,
        });

        if (!isCancelled && plan) {
          setFlightPlan(plan);
          
          // Find matching satellite and ground station
          const sat = sats.find(s => s.id === plan.satId);
          const gs = stations.find(g => g.id === plan.gsId);
          
          console.log("[AssignOverpassPage] Matched resources:", {
            satellite: sat ? { id: sat.id, name: sat.name, hasTLE: !!(sat.tle.line1 && sat.tle.line2) } : null,
            groundStation: gs ? { id: gs.id, name: gs.name } : null,
            flightPlanSatId: plan.satId,
            flightPlanGsId: plan.gsId,
          });

          setSatellite(sat || null);
          setGroundStation(gs || null);
        }
      } catch (error) {
        console.error("[AssignOverpassPage] Failed to load flight plan:", {
          error,
          errorMessage: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
        });
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };
    load();
    return () => {
      isCancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    router.push(`/platform/flight/${id}`);
  };

  if (isLoading && !flightPlan) {
    return <AssignOverpassSkeleton />;
  }

  if (!flightPlan) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-center items-center h-[70vh]">
          <p className="text-muted-foreground">Flight plan not found</p>
        </div>
      </div>
    );
  }

  // Only allow assignment if status is APPROVED
  if (flightPlan.status !== "APPROVED") {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Flight plan must be approved before assigning to an overpass
            </p>
            <p className="text-sm text-muted-foreground">
              Current status: <span className="font-medium">{flightPlan.status}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Transform satellite data for react-sat-map
  const satelliteWithTLE: (SatMapSatellite & { id: number }) | null = 
    satellite && satellite.tle.line1 && satellite.tle.line2 
      ? {
          id: satellite.id,
          name: satellite.name,
          tle: {
            line1: satellite.tle.line1,
            line2: satellite.tle.line2,
          },
        }
      : null;

  console.log("[AssignOverpassPage] Satellite TLE transformation:", {
    hasSatellite: !!satellite,
    hasTLELine1: !!(satellite?.tle.line1),
    hasTLELine2: !!(satellite?.tle.line2),
    satelliteWithTLE: satelliteWithTLE ? {
      id: satelliteWithTLE.id,
      name: satelliteWithTLE.name,
      hasTLE: true,
    } : null,
  });

  return (
    <div className="flex flex-col p-6 gap-6">
      <div className="flex flex-col gap-4 flex-shrink-0">
        <Button variant="ghost" onClick={handleBack} className="w-fit -ml-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Flight Plan
        </Button>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Assign Overpass</h1>
            <p className="text-muted-foreground">
              Select an overpass window for {flightPlan.name || "this flight plan"}
            </p>
          </div>
        </div>

        <FlightPlanSteps status={flightPlan.status} />

        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Flight Plan Details</CardTitle>
            <CardDescription>
              Configuration for the flight plan being assigned
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Plan Name</p>
                <p className="font-medium">{flightPlan.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satellite</p>
                <p className="font-medium">
                  {satellite?.name || `ID: ${flightPlan.satId}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ground Station</p>
                <p className="font-medium">
                  {groundStation?.name || `ID: ${flightPlan.gsId}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-1 flex-shrink-0">
          <CardTitle>Available Overpass Windows</CardTitle>
          <CardDescription>
            Select a satellite overpass to associate with this flight plan. The plan will be scheduled for execution during the selected window.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          {satelliteWithTLE && groundStation ? (
            <AssignOverpassClient
              satellite={satelliteWithTLE}
              groundStation={groundStation}
              flightPlanId={flightPlan.id}
              onAssignmentComplete={() => router.push(`/platform/flight/${id}`)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Missing satellite TLE data or ground station information
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
