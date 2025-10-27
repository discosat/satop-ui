"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Satellite } from "react-sat-map";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { SatelliteSelect } from "../../../components/satellite-select";
import { SatelliteMap } from "./satellite-map";
import { SatelliteInfoCard } from "./satellite-info-card";
import { RefreshButton } from "@/components/refresh-button";
import { Separator } from "@/components/ui/separator";
import type { SatelliteInfoType } from "./satellite-map";

interface SatelliteTrackingClientProps {
  satellites: (Satellite & { id: number })[];
  groundStations: GroundStation[];
}

export function SatelliteTrackingClient({
  satellites,
  groundStations,
}: SatelliteTrackingClientProps) {
  // State for selections - use empty string as default to prevent hydration mismatches
  const [selectedSatellite, setSelectedSatellite] = useState<string>("");
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
  }, [satellites, selectedSatellite]);

  // Get filtered data based on selections
  const filteredSatellites = useMemo(() => {
    if (!selectedSatellite) return satellites;
    return satellites.filter(sat => sat.name === selectedSatellite);
  }, [satellites, selectedSatellite]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
        <SatelliteSelect
          satellites={satellites}
          selectedSatellite={selectedSatellite}
          onSatelliteChange={setSelectedSatellite}
        />
        <div className="flex items-end justify-end">
          <RefreshButton onClick={handleRefresh} />
        </div>
      </div>

      <Separator className="my-2" />

      {/* Content Section - Full width map with floating info card */}
      <div className="relative flex-1 min-h-0">
        {/* Full-width Satellite Map */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <SatelliteMap
            key={`map-${refreshKey}`}
            satellites={filteredSatellites}
            groundStations={groundStations}
            onSatelliteInfoUpdate={handleSatelliteInfoUpdate}
            showOrbit={showOrbit}
          />
        </div>

        {/* Floating Satellite Info Card - Top Right */}
        <div className="absolute top-4 right-4 z-10 w-80 max-w-[calc(100%-2rem)]">
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
      </div>
    </div>
  );
}
