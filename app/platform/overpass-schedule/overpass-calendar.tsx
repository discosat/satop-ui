"use client";

import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RefreshButton } from "@/components/refresh-button";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { getOverpassWindows } from "@/app/api/overpass/overpass-service";
import type { 
  Overpass as APIOverpass, 
  OverpassQueryParams 
} from "@/app/api/overpass/types";
import type { TimePeriod } from "./time-period-select";
import { getDateRangeFromPeriod } from "./time-period-select";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getFlightPlans,
  associateOverpass,
} from "@/app/api/flight/flight-plan-service";
import type { FlightPlan } from "@/app/api/flight/types";
import { Satellite } from "@/app/api/satellites/types";
import {
  formatTime,
  getDuration,
  getPassQuality,
} from "@/components/overpass/overpass-utils";
import { OverpassList } from "@/components/overpass/overpass-list";
import Protected from "@/components/protected";

interface OverpassCalendarProps {
  satelliteName: string;
  groundStationId: string;
  timePeriod: TimePeriod;
  satellites: Satellite[];
  groundStations: GroundStation[];
}

export function OverpassCalendar({
  satelliteName,
  groundStationId,
  timePeriod,
  satellites,
  groundStations,
}: OverpassCalendarProps) {
  const [overpasses, setOverpasses] = useState<APIOverpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  // Associate dialog state
  const [associateOpen, setAssociateOpen] = useState<boolean>(false);
  const [associateTarget, setAssociateTarget] = useState<APIOverpass | null>(null);
  const [flightPlans, setFlightPlans] = useState<FlightPlan[]>([]);
  const [selectedFlightPlanId, setSelectedFlightPlanId] = useState<string>("");
  const [associating, setAssociating] = useState<boolean>(false);
  // Client-side filters
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [associationFilter, setAssociationFilter] = useState<"any" | "associated" | "unassociated">("any");

  // Get the selected satellite and ground station objects
  const selectedSatellite = useMemo(() => 
    satellites.find(sat => sat.name === satelliteName),
    [satellites, satelliteName]
  );

  const groundStation = useMemo(() => 
    groundStations.find(gs => gs.id.toString() === groundStationId),
    [groundStations, groundStationId]
  );

  // Set mounted state on first render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch overpasses function
  const fetchOverpasses = async (): Promise<void> => {
    if (!selectedSatellite || !groundStation) {
      setOverpasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const satelliteId = selectedSatellite.id || 1;
      const dateRange = getDateRangeFromPeriod(timePeriod);

      const queryParams: OverpassQueryParams = {
        startTime: dateRange.start.toISOString(),
        endTime: dateRange.end.toISOString(),
        minimumElevation: 5,
        maxResults: 50,
        minimumDuration: 60,
      };

      const data = await getOverpassWindows(
        satelliteId,
        groundStation.id,
        queryParams
      );

      setOverpasses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Fetch overpasses when dependencies change
  useEffect(() => {
    fetchOverpasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [satelliteName, groundStationId, timePeriod]);

  useEffect(() => {
    if (!associateOpen) {
      return;
    }

    const loadPlans = async () => {
      const sat = satellites.find(s => s.name === satelliteName);
      const gs = groundStations.find(g => g.id.toString() === groundStationId);
      
      if (!sat || !gs) {
        setFlightPlans([]);
        setSelectedFlightPlanId("");
        return;
      }

      try {
        const plans = await getFlightPlans();
        const satelliteId = sat.id || 1;
        // Only APPROVED plans that match current satellite and ground station
        const eligible = plans.filter(
          (p) =>
            p.status === "APPROVED" &&
            p.gsId === gs.id &&
            p.satId === satelliteId
        );
        const sorted = eligible
          .slice()
          .sort((a, b) => Number(a.id) - Number(b.id));
        setFlightPlans(sorted);
        if (sorted.length > 0) {
          setSelectedFlightPlanId(String(sorted[0].id));
        } else {
          setSelectedFlightPlanId("");
        }
      } catch {
        // Ignore; UI will still show empty select
        setFlightPlans([]);
        setSelectedFlightPlanId("");
      }
    };
    
    loadPlans();
    // Only depend on primitive values and the dialog open state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associateOpen]);



  // Derived: apply filters client-side
  const filteredOverpasses = React.useMemo(() => {
    const matchesQuality = (op: APIOverpass) => {
      if (selectedQualities.length === 0) return true;
      const q = getPassQuality(op.maxElevation).quality;
      return selectedQualities.includes(q);
    };
    const matchesAssociation = (op: APIOverpass) => {
      if (associationFilter === "any") return true;
      const isAssociated = Boolean(op.associatedFlightPlan?.id);
      return associationFilter === "associated" ? isAssociated : !isAssociated;
    };
    return overpasses.filter(
      (op) => matchesQuality(op) && matchesAssociation(op)
    );
  }, [overpasses, selectedQualities, associationFilter]);

  // Counts for badges
  const qualityCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    ["Excellent", "Great"].forEach((label) => counts.set(label, 0));
    overpasses.forEach((op) => {
      const q = getPassQuality(op.maxElevation).quality;
      if (counts.has(q)) counts.set(q, (counts.get(q) || 0) + 1);
    });
    return counts;
  }, [overpasses]);

  const associationCounts = React.useMemo(() => {
    let associated = 0;
    let unassociated = 0;
    overpasses.forEach((op) => {
      if (op.associatedFlightPlan?.id) associated += 1;
      else unassociated += 1;
    });
    return { associated, unassociated };
  }, [overpasses]);

  const hasActiveFilters =
    selectedQualities.length > 0 || associationFilter !== "any";

  const toggleQuality = (label: string) => {
    setSelectedQualities((prev) =>
      prev.includes(label) ? prev.filter((q) => q !== label) : [...prev, label]
    );
  };

  const clearFilters = () => {
    setSelectedQualities([]);
    setAssociationFilter("any");
  };

  // Render custom actions for each overpass
  const renderOverpassActions = (pass: APIOverpass) => (
    <>
      {pass.associatedFlightPlan?.id && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`/platform/flight/${pass.associatedFlightPlan.id}`}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span className="hidden sm:inline">Assigned</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-xs">
                View flight plan
                {pass.associatedFlightPlan.name
                  ? `: ${pass.associatedFlightPlan.name}`
                  : ""}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {!pass.associatedFlightPlan?.id && (
        <Protected requireOperator fallback={<div ></div>}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setAssociateTarget(pass);
              setAssociateOpen(true);
            }}
          >
            Associate
          </Button>
        </Protected>
      )}
    </>
  );

  return (
    <Card className="w-full h-full shadow-md flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {selectedSatellite?.name || "Satellite"} Overpasses
            </CardTitle>
            <CardDescription>
              {timePeriod === "today"
                ? "Today"
                : timePeriod === "tomorrow"
                ? "Tomorrow"
                : timePeriod === "next-3-days"
                ? "Next 3 days"
                : timePeriod === "next-week"
                ? "Next week"
                : timePeriod === "next-2-weeks"
                ? "Next 2 weeks"
                : "Next month"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between text-muted-foreground"
                >
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  Quality
                  {selectedQualities.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedQualities.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[260px] p-0">
                <Command>
                  <CommandInput placeholder="Search quality..." />
                  <CommandEmpty>No options.</CommandEmpty>
                  <CommandGroup>
                    {["Excellent", "Great", "Good", "Poor"].map((label) => (
                      <CommandItem
                        key={label}
                        onSelect={() => toggleQuality(label)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              selectedQualities.includes(label)
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{label}</span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {qualityCounts.get(label) || 0}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-between text-muted-foreground"
                >
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  Association
                  {associationFilter !== "any" && (
                    <Badge variant="secondary" className="ml-2">
                      1
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[280px] p-0">
                <Command>
                  <CommandEmpty>No options.</CommandEmpty>
                  <CommandGroup>
                    {[
                      {
                        value: "associated",
                        label: "With flight plan",
                        count: associationCounts.associated,
                      },
                      {
                        value: "unassociated",
                        label: "Without flight plan",
                        count: associationCounts.unassociated,
                      },
                    ].map((item) => (
                      <CommandItem
                        key={item.value}
                        onSelect={() =>
                          setAssociationFilter((prev) =>
                            prev === item.value
                              ? "any"
                              : (item.value as "associated" | "unassociated")
                          )
                        }
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div
                            className={cn(
                              "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                              associationFilter === item.value
                                ? "bg-primary text-primary-foreground"
                                : "opacity-50 [&_svg]:invisible"
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {item.count}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            )}

            <RefreshButton
              onClick={() => {
                fetchOverpasses();
              }}
            />
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 pt-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-1.5 mb-3 text-sm text-muted-foreground flex-shrink-0">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {groundStation?.name || "No ground station selected"}
            {groundStation && (
              <>
                ({groundStation.location.latitude.toFixed(2)}°N,{" "}
                {groundStation.location.longitude.toFixed(2)}°E)
              </>
            )}
          </span>
        </div>
        <div className="flex-1 min-h-0">
          <OverpassList
            overpasses={filteredOverpasses}
            loading={loading}
            error={error}
            isMounted={isMounted}
            emptyMessage="No passes match the current selection"
            emptyDescription={`Try broadening your filters for more results from ${groundStation?.name || "your ground station"} in the selected time period.`}
            renderOverpassActions={renderOverpassActions}
          />
        </div>
      </CardContent>
      <CardFooter className="pt-0 text-xs text-muted-foreground flex-shrink-0">
        <p>Minimum elevation: 5° above horizon</p>
      </CardFooter>
      <Dialog open={associateOpen} onOpenChange={setAssociateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associate overpass to a flight plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-1">
              {associateTarget ? (
                <>
                  <div>
                    Window {formatTime(associateTarget.startTime, isMounted)} -{" "}
                    {formatTime(associateTarget.endTime, isMounted)} (
                    {getDuration(
                      associateTarget.startTime,
                      associateTarget.endTime
                    )}{" "}
                    min)
                  </div>
                  <div>
                    Satellite:{" "}
                    <span className="font-medium">
                      {selectedSatellite?.name ||
                        `Satellite ${satellites?.[0]?.id || ""}`}
                    </span>
                  </div>
                  <div>
                    Ground station:{" "}
                    <span className="font-medium">
                      {groundStation?.name || "—"}
                    </span>
                  </div>
                </>
              ) : (
                "Select a flight plan"
              )}
            </div>
            <div className="space-y-1">
              <Select
                value={selectedFlightPlanId}
                onValueChange={(v) => setSelectedFlightPlanId(v)}
                disabled={flightPlans.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      flightPlans.length === 0
                        ? "No eligible flight plans"
                        : "Select flight plan"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {flightPlans.map((fp) => (
                    <SelectItem key={fp.id} value={String(fp.id)}>
                      {`${fp.name || `Plan ${fp.id}`} • #${fp.id} • ${fp.status}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {flightPlans.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No APPROVED flight plans match the selected satellite and
                  ground station. Approve a plan for{" "}
                  {selectedSatellite?.name || "this satellite"} at{" "}
                  {groundStation?.name || "this ground station"} to enable
                  association.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssociateOpen(false)}>
              Cancel
            </Button>
            <Protected requireOperator>
              <Button
                disabled={
                  !associateTarget ||
                  !selectedFlightPlanId ||
                  associating ||
                  flightPlans.length === 0
                }
                onClick={async () => {
                  if (!associateTarget || !selectedFlightPlanId) return;
                  setAssociating(true);
                  try {
                    await associateOverpass(Number(selectedFlightPlanId), {
                      startTime: associateTarget.startTime,
                      endTime: associateTarget.endTime,
                    });
                    toast.success("Overpass associated to flight plan");
                    setAssociateOpen(false);
                    setAssociateTarget(null);
                    await fetchOverpasses();
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : "Failed to associate overpass";
                    toast.error("Association failed", { description: msg });
                  } finally {
                    setAssociating(false);
                  }
                }}
              >
                {associating ? "Associating..." : "Associate"}
              </Button>
            </Protected>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
