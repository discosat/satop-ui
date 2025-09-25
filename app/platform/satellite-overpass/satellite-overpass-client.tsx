"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Satellite } from "react-sat-map";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";
import { SatelliteSelect } from "./satellite-select";
import { GroundStationSelect } from "./ground-station-select";
import { TimePeriodSelect, TimePeriod } from "./time-period-select";
import { SatelliteMap } from "./satellite-map";
import { OverpassCalendar } from "./overpass-calendar";
import { SatelliteInfoCard } from "./satellite-info-card";
import { RefreshButton } from "@/components/refresh-button";
import { Separator } from "@/components/ui/separator";
import { Rocket, Radio } from "lucide-react";
import type { SatelliteInfoType } from "./satellite-map";

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
  const [showOrbit, setShowOrbit] = useState<string>("orbit");
  const [satelliteInfo, setSatelliteInfo] = useState<SatelliteInfoType>({
    altitude: 0,
    velocity: 0,
    latitude: 0,
    longitude: 0,
    timestamp: new Date(),
  });

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

  const filteredGroundStations = useMemo(() => {
    if (!selectedGroundStation) return groundStations;
    return groundStations.filter(gs => gs.id.toString() === selectedGroundStation);
  }, [groundStations, selectedGroundStation]);

  const selectedGroundStationData = useMemo(() => {
    if (!selectedGroundStation) return null;
    return groundStations.find(gs => gs.id.toString() === selectedGroundStation);
  }, [groundStations, selectedGroundStation]);

  // TODO: Implement date range filtering
  // const dateRange = useMemo(() => {
  //   return getDateRangeFromPeriod(selectedTimePeriod);
  // }, [selectedTimePeriod]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSatelliteInfoUpdate = useCallback((info: SatelliteInfoType) => {
    setSatelliteInfo(info);
  }, []);

  const handleRefreshPosition = () => {
    // Force refresh by updating the key
    setRefreshKey(prev => prev + 1);
  };

  const handleCenterOnSatellite = () => {
    // This can be enhanced to trigger map centering
    console.log("Centering on satellite");
  };

  return (
    <div className="flex flex-col h-full gap-6">
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

      <Separator />

      {/* Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Overpass Calendar - Takes 2/3 of the space */}
        <div className="flex flex-col lg:col-span-2 min-h-0">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 flex-shrink-0">
            <Rocket className="h-5 w-5 text-blue-500" />
            Overpass Schedule
          </h3>
          <div className="flex-1 min-h-0">
            <OverpassCalendar 
              key={`calendar-${refreshKey}`}
              satellites={filteredSatellites}
              groundStation={selectedGroundStationData}
              timePeriod={selectedTimePeriod}
            />
          </div>
        </div>

        {/* Satellite Map - Takes 1/3 of the space */}
        <div className="flex flex-col lg:col-span-1 min-h-0">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 flex-shrink-0">
            <Radio className="h-5 w-5 text-blue-500" />
            Real-time Tracking
          </h3>
          <div className="flex-1 min-h-0 flex flex-col gap-4">
            {/* Satellite Info Card */}
            <div className="flex-shrink-0">
              <SatelliteInfoCard
                name={filteredSatellites[0]?.name || "Unknown Satellite"}
                info={satelliteInfo}
                showOrbit={showOrbit}
                setShowOrbit={setShowOrbit}
                isLoading={false}
                refreshPosition={handleRefreshPosition}
                centerOnSatellite={handleCenterOnSatellite}
              />
            </div>
            
            {/* Satellite Map */}
            <div className="flex-1 min-h-0">
              <SatelliteMap
                key={`map-${refreshKey}`}
                satellites={filteredSatellites}
                groundStations={filteredGroundStations}
                onSatelliteInfoUpdate={handleSatelliteInfoUpdate}
                showOrbit={showOrbit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
