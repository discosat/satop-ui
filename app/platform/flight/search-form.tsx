"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Search, Filter, X, Check, ChevronDown, Calendar as CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { FlightPlan, FlightPlanStatus } from "@/app/api/platform/flight/flight-plan-service";
import { Satellite } from "@/app/api/platform/satellites/satellite-service";
import { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  flightPlans: FlightPlan[];
  satellites: Satellite[];
  groundStations: GroundStation[];
}

export function SearchForm({ flightPlans, satellites, groundStations }: SearchFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Get current filter values from URL
  const currentQuery = searchParams.get('query') || '';
  const currentSatellites = searchParams.get('satellites')?.split(',').filter(Boolean) || [];
  const currentGroundStations = searchParams.get('groundStations')?.split(',').filter(Boolean) || [];
  const currentStatuses = searchParams.get('statuses')?.split(',').filter(Boolean) || [];
  const currentTimeRange = searchParams.get('timeRange') || '';

  // Calculate counts for each filter option
  const satelliteCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    satellites.forEach(sat => {
      const count = flightPlans.filter(plan => 
        plan.satId.toString() === sat.id.toString() && plan.status !== 'superseded'
      ).length;
      counts.set(sat.id.toString(), count);
    });
    return counts;
  }, [flightPlans, satellites]);

  const groundStationCounts = React.useMemo(() => {
    const counts = new Map<string, number>();
    groundStations.forEach(gs => {
      const count = flightPlans.filter(plan => 
        plan.gsId.toString() === gs.id.toString() && plan.status !== 'superseded'
      ).length;
      counts.set(gs.id.toString(), count);
    });
    return counts;
  }, [flightPlans, groundStations]);

  const statusCounts = React.useMemo(() => {
    const statusOptions = ['pending', 'approved', 'rejected', 'transmitted'] as FlightPlanStatus[];
    const counts = new Map<string, number>();
    statusOptions.forEach(status => {
      const count = flightPlans.filter(plan => plan.status === status).length;
      counts.set(status, count);
    });
    return counts;
  }, [flightPlans]);

  // Debounce search to avoid too many requests
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  const updateFilters = (filterType: string, values: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (values.length > 0) {
      params.set(filterType, values.join(','));
    } else {
      params.delete(filterType);
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const handleSatelliteFilter = (satelliteId: string) => {
    const newSatellites = currentSatellites.includes(satelliteId)
      ? currentSatellites.filter(id => id !== satelliteId)
      : [...currentSatellites, satelliteId];
    updateFilters('satellites', newSatellites);
  };

  const handleGroundStationFilter = (groundStationId: string) => {
    const newGroundStations = currentGroundStations.includes(groundStationId)
      ? currentGroundStations.filter(id => id !== groundStationId)
      : [...currentGroundStations, groundStationId];
    updateFilters('groundStations', newGroundStations);
  };

  const handleStatusFilter = (status: string) => {
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    updateFilters('statuses', newStatuses);
  };

  const handleTimeRangeFilter = (range: string) => {
    const params = new URLSearchParams(searchParams);
    if (range && range !== currentTimeRange) {
      params.set('timeRange', range);
    } else {
      params.delete('timeRange');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('satellites');
    params.delete('groundStations');
    params.delete('statuses');
    params.delete('timeRange');
    replace(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = currentSatellites.length > 0 || currentGroundStations.length > 0 || currentStatuses.length > 0 || currentTimeRange !== '';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'transmitted': return 'Transmitted';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search plans..." 
            className="pl-8"
            defaultValue={currentQuery}
            onChange={(e) => handleSearch(e.target.value)} 
          />
        </div>

        {/* Satellite Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between text-muted-foreground">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              Satellites
              {currentSatellites.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentSatellites.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search satellites..." />
              <CommandEmpty>No satellites found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {satellites.map((satellite) => (
                  <CommandItem
                    key={satellite.id}
                    onSelect={() => handleSatelliteFilter(satellite.id.toString())}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        currentSatellites.includes(satellite.id.toString())
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="truncate">{satellite.name}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {satelliteCounts.get(satellite.id.toString()) || 0}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Ground Station Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between text-muted-foreground">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              Ground Stations
              {currentGroundStations.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentGroundStations.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search ground stations..." />
              <CommandEmpty>No ground stations found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {groundStations.map((groundStation) => (
                  <CommandItem
                    key={groundStation.id}
                    onSelect={() => handleGroundStationFilter(groundStation.id.toString())}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        currentGroundStations.includes(groundStation.id.toString())
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="truncate">{groundStation.name}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {groundStationCounts.get(groundStation.id.toString()) || 0}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Time Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between text-muted-foreground">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              Scheduled Time
              {currentTimeRange && (
                <Badge variant="secondary" className="ml-2">
                  1
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandEmpty>No time ranges found.</CommandEmpty>
              <CommandGroup>
                {[
                  { value: 'today', label: 'Today' },
                  { value: 'tomorrow', label: 'Tomorrow' },
                  { value: 'this-week', label: 'This Week' },
                  { value: 'next-week', label: 'Next Week' },
                  { value: 'this-month', label: 'This Month' },
                  { value: 'next-month', label: 'Next Month' }
                ].map((timeRange) => (
                  <CommandItem
                    key={timeRange.value}
                    onSelect={() => handleTimeRangeFilter(timeRange.value)}
                    className="flex items-center"
                  >
                    <div className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      currentTimeRange === timeRange.value
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}>
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{timeRange.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between text-muted-foreground">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              Status
              {currentStatuses.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {currentStatuses.length}
                </Badge>
              )}
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[250px] p-0">
            <Command>
              <CommandEmpty>No statuses found.</CommandEmpty>
              <CommandGroup>
                {(['pending', 'approved', 'rejected', 'transmitted'] as FlightPlanStatus[]).map((status) => (
                  <CommandItem
                    key={status}
                    onSelect={() => handleStatusFilter(status)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        currentStatuses.includes(status)
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span>{getStatusLabel(status)}</span>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {statusCounts.get(status) || 0}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </Button>
        )}
      </div>


    </div>
  );
}