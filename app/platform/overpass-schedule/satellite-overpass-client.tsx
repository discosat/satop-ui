"use client";

import { useState } from "react";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { SatelliteSelect } from "../../../components/satellite-select";
import { GroundStationSelect } from "../../../components/ground-station-select";
import { TimePeriodSelect, TimePeriod } from "./time-period-select";
import { OverpassCalendar } from "./overpass-calendar";
import { RefreshButton } from "@/components/refresh-button";
import { Separator } from "@/components/ui/separator";
import { Satellite } from "@/app/api/satellites/types";

interface SatelliteOverpassClientProps {
  satellites: Satellite[];
  groundStations: GroundStation[];
}

export function SatelliteOverpassClient({
  satellites,
  groundStations,
}: SatelliteOverpassClientProps) {
  // State for selections - initialize with first items or empty string
  const [selectedSatellite, setSelectedSatellite] = useState<string>(() => 
    satellites.length > 0 ? satellites[0].name : ""
  );
  const [selectedGroundStationId, setSelectedGroundStationId] = useState<string>(() =>
    groundStations.length > 0 ? groundStations[0].id.toString() : ""
  );
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("next-3-days");
  const [refreshKey, setRefreshKey] = useState(0);

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
          selectedGroundStation={selectedGroundStationId}
          onGroundStationChange={setSelectedGroundStationId}
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
          key={refreshKey}
          satelliteName={selectedSatellite}
          groundStationId={selectedGroundStationId}
          timePeriod={selectedTimePeriod}
          satellites={satellites}
          groundStations={groundStations}
        />
      </div>
    </div>
  );
}
