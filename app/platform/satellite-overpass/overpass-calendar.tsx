"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Clock,
  Calendar,
  MapPin,
  ArrowUpRight,
  Satellite as SatelliteIcon,
  Info,
  Eye,
  CheckCircle2,
  Filter,
  Check,
  ChevronDown,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Satellite } from "react-sat-map";
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

// Extended satellite interface that includes the original API ID
interface SatelliteWithId extends Satellite {
  id?: number;
}

interface OverpassCalendarProps {
  satellites: SatelliteWithId[];
  groundStation?: GroundStation | null;
  timePeriod?: TimePeriod;
}

export function OverpassCalendar({
  satellites,
  groundStation,
  timePeriod = "next-3-days",
}: OverpassCalendarProps) {
  const [overpasses, setOverpasses] = useState<APIOverpass[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  // Associate dialog state
  const [associateOpen, setAssociateOpen] = useState<boolean>(false);
  const [associateTarget, setAssociateTarget] = useState<APIOverpass | null>(
    null
  );
  const [flightPlans, setFlightPlans] = useState<FlightPlan[]>([]);
  const [selectedFlightPlanId, setSelectedFlightPlanId] = useState<string>("");
  const [associating, setAssociating] = useState<boolean>(false);
  // Client-side filters
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [associationFilter, setAssociationFilter] = useState<
    "any" | "associated" | "unassociated"
  >("any");

  // Get the selected satellite (first one if multiple)
  const selectedSatellite = satellites?.[0];

  // Convert time period to date range
  const getDateRangeFromPeriod = (
    period: TimePeriod
  ): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(start);

    switch (period) {
      case "today":
        end.setDate(start.getDate() + 1);
        break;
      case "tomorrow":
        start.setDate(start.getDate() + 1);
        end.setDate(start.getDate() + 1);
        break;
      case "next-3-days":
        end.setDate(start.getDate() + 3);
        break;
      case "next-week":
        end.setDate(start.getDate() + 7);
        break;
      case "next-2-weeks":
        end.setDate(start.getDate() + 14);
        break;
      case "next-month":
        end.setMonth(start.getMonth() + 1);
        break;
    }

    return { start, end };
  };

  const fetchOverpasses = useCallback(async (): Promise<void> => {
    if (!selectedSatellite || !groundStation) {
      setOverpasses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get the satellite ID from the satellite data or use a default mapping
      const satelliteId =
        selectedSatellite.id ||
        (selectedSatellite.name.includes("ISS") ? 1 : 1);

      const dateRange = getDateRangeFromPeriod(timePeriod);

      const queryParams: OverpassQueryParams = {
        startTime: dateRange.start.toISOString(),
        endTime: dateRange.end.toISOString(),
        minimumElevation: 5, // Minimum 5 degrees elevation
        maxResults: 50,
        minimumDuration: 60, // Minimum 1 minute duration
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
  }, [selectedSatellite, groundStation, timePeriod]);

  useEffect(() => {
    setIsMounted(true);
    fetchOverpasses();
  }, [fetchOverpasses]);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans = await getFlightPlans();
        const effectiveSatId =
          (selectedSatellite && selectedSatellite.id) ||
          (selectedSatellite?.name?.includes("ISS") ? 1 : 1);
        // Only APPROVED plans that match current satellite and ground station
        const eligible = plans.filter(
          (p) =>
            p.status === "APPROVED" &&
            !!groundStation &&
            p.gsId === groundStation.id &&
            p.satId === effectiveSatId
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
      }
    };
    if (associateOpen) {
      loadPlans();
    }
  }, [associateOpen, selectedSatellite, groundStation]);

  // Format time only - fixed to prevent hydration mismatch
  const formatTime = (dateString: string): string => {
    // Skip formatting during server render
    if (!isMounted) return "";

    const date = new Date(dateString);
    return date.toLocaleTimeString("da-DK", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Calculate duration in minutes
  const getDuration = (startTime: string, endTime: string): number => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / (60 * 1000));
  };

  // Check if overpass is happening now
  const isHappeningNow = (startTime: string, endTime: string): boolean => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  // Determine pass quality based on elevation
  const getPassQuality = (
    elevation: number
  ): {
    quality: string;
    variant: "default" | "secondary" | "outline";
    color: string;
  } => {
    if (elevation >= 60)
      return {
        quality: "Excellent",
        variant: "default",
        color: "text-green-700 bg-green-100 border-green-200",
      };
    if (elevation >= 40)
      return {
        quality: "Great",
        variant: "default",
        color: "text-blue-700 bg-blue-100 border-blue-200",
      };
    if (elevation >= 25)
      return {
        quality: "Good",
        variant: "secondary",
        color: "text-orange-700 bg-orange-100 border-orange-200",
      };
    if (elevation >= 15)
      return {
        quality: "Fair",
        variant: "outline",
        color: "text-yellow-700 bg-yellow-100 border-yellow-200",
      };
    return {
      quality: "Poor",
      variant: "outline",
      color: "text-red-700 bg-red-100 border-red-200",
    };
  };

  // Group overpasses by date
  const groupOverpassesByDate = (passes: APIOverpass[]) => {
    const groups: { [key: string]: APIOverpass[] } = {};

    passes.forEach((pass) => {
      const date = new Date(pass.startTime);
      const dateKey = date.toDateString(); // e.g., "Mon Sep 25 2025"

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(pass);
    });

    return groups;
  };

  // Format date for display
  const formatDateHeader = (dateString: string): string => {
    if (!isMounted) return "";

    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if it's today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("da-DK", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  };

  console.log("Overpasses:", overpasses);

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

    if (filteredOverpasses.length === 0) {
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
                  No passes match the current selection
                </h3>
                <p className="text-xs text-muted-foreground/80 max-w-xs">
                  Try broadening your filters for more results from{" "}
                  <span className="font-medium">
                    {groundStation?.name || "Aarhus"}
                  </span>{" "}
                  in the selected time period.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-full">
                <Info className="h-3 w-3" />
                <span>Clear filters to see all passes</span>
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
        <div className="space-y-4 p-1">
          {(() => {
            const groupedPasses = groupOverpassesByDate(filteredOverpasses);
            const sortedDates = Object.keys(groupedPasses).sort(
              (a, b) => new Date(a).getTime() - new Date(b).getTime()
            );

            return sortedDates.map((dateKey) => (
              <div key={dateKey} className="space-y-3">
                {/* Date Header */}
                <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b pb-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDateHeader(dateKey)}
                  </h3>
                </div>

                {/* Passes for this date */}
                <div className="space-y-3">
                  {groupedPasses[dateKey].map((pass, passIndex) => {
                    const isNow = isHappeningNow(pass.startTime, pass.endTime);
                    const passQuality = getPassQuality(pass.maxElevation);
                    const duration = getDuration(pass.startTime, pass.endTime);
                    // Calculate global pass index
                    const globalIndex = filteredOverpasses.findIndex(
                      (p) => p === pass
                    );

                    return (
                      <Card
                        key={`${dateKey}-${passIndex}`}
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
                                  Pass #{globalIndex + 1}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="font-mono">
                                    {formatTime(pass.startTime)} -{" "}
                                    {formatTime(pass.endTime)}
                                  </span>
                                </div>
                                <div className="text-muted-foreground">
                                  ({duration} min)
                                </div>
                              </div>
                            </div>

                            {/* Right side - Elevation and quality */}
                            <div className="flex items-center gap-3">
                              {pass.associatedFlightPlan?.id && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Link
                                        href={`/platform/flight/${pass.associatedFlightPlan.id}`}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span className="hidden sm:inline">
                                          Assigned
                                        </span>
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
                              )}

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
              </div>
            ));
          })()}
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
        <div className="flex-1 min-h-0">{renderContent()}</div>
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
                    Window {formatTime(associateTarget.startTime)} -{" "}
                    {formatTime(associateTarget.endTime)} (
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* toasts now handled by sonner's global component elsewhere */}
    </Card>
  );
}
