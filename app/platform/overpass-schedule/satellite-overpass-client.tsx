"use client";

import { useState, useMemo, useEffect } from "react";
import { Satellite } from "react-sat-map";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { SatelliteSelect } from "../../../components/satellite-select";
import { GroundStationSelect } from "../../../components/ground-station-select";
import { TimePeriodSelect, TimePeriod } from "./time-period-select";
import { OverpassCalendar } from "./overpass-calendar";
import { RefreshButton } from "@/components/refresh-button";
import { Separator } from "@/components/ui/separator";

interface SatelliteOverpassClientProps {
  satellites: (Satellite & { id: number })[];
  groundStations: GroundStation[];
}

export function SatelliteOverpassClient({
  satellites,
  groundStations,
}: SatelliteOverpassClientProps) {
  // State for selections - use empty string as default to prevent hydration mismatches
  const [selectedSatellite, setSelectedSatellite] = useState<string>("");
  const [selectedGroundStation, setSelectedGroundStation] = useState<string>("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("next-3-days");
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize default selections on first render to prevent hydration issues
  useEffect(() => {
    if (selectedSatellite === "" && satellites.length > 0) {
      setSelectedSatellite(satellites[0].name);
    }
    if (selectedGroundStation === "" && groundStations.length > 0) {
      setSelectedGroundStation(groundStations[0].id.toString());
    }
  }, [satellites, groundStations, selectedSatellite, selectedGroundStation]);

  // Get filtered data based on selections
  const filteredSatellites = useMemo(() => {
    if (!selectedSatellite) return satellites;
    return satellites.filter(sat => sat.name === selectedSatellite);
  }, [satellites, selectedSatellite]);

  const selectedGroundStationData = useMemo(() => {
    if (!selectedGroundStation) return null;
    return groundStations.find(gs => gs.id.toString() === selectedGroundStation);
  }, [groundStations, selectedGroundStation]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-6">
      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 flex-shrink-0">
        <SatelliteSelect
          satellites={satellites}
          selectedSatellite={selectedSatellite}
          onSatelliteChange={setSelectedSatellite}
        />
        <GroundStationSelect
          groundStations={groundStations}
          selectedGroundStation={selectedGroundStation}
          onGroundStationChange={setSelectedGroundStation}
        />
        <TimePeriodSelect
          selectedPeriod={selectedTimePeriod}
          onPeriodChange={setSelectedTimePeriod}
        />
        <div className="flex items-end">
          <RefreshButton onClick={handleRefresh} />
        </div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Overpass Calendar */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <OverpassCalendar 
          key={`calendar-${refreshKey}`}
          satellites={filteredSatellites}
          groundStation={selectedGroundStationData}
          timePeriod={selectedTimePeriod}
        />
      </div>
    </div>
  );
}
