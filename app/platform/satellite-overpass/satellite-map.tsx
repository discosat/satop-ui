"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { SatelliteMarkers, Satellite } from "react-sat-map";
import Map, { Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "react-sat-map/style.css";
import * as satellite from "satellite.js";
import { SatelliteOrbit } from "./satellite-orbit";
import Image from "next/image";
import sat from "@/assets/sat.svg";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { useTheme } from "next-themes";

type EciVec3 = {
  x: number;
  y: number;
  z: number;
};

export type SatelliteInfoType = {
  altitude: number;
  velocity: number;
  latitude: number;
  longitude: number;
  timestamp: Date;
};

interface SatelliteMapProps {
  satellites: Satellite[];
  groundStations: GroundStation[];
  onSatelliteInfoUpdate?: (info: SatelliteInfoType) => void;
  showOrbit?: string;
}

export function SatelliteMap({
  satellites,
  groundStations,
  onSatelliteInfoUpdate,
  showOrbit = "orbit",
}: SatelliteMapProps) {
  const theme = useTheme();
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 1,
  });
  const [satelliteInfo, setSatelliteInfo] = useState<SatelliteInfoType>({
    altitude: 0,
    velocity: 0,
    latitude: 0,
    longitude: 0,
    timestamp: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);

  
  // Use ref to avoid dependency issues with onSatelliteInfoUpdate
  const onSatelliteInfoUpdateRef = useRef(onSatelliteInfoUpdate);
  onSatelliteInfoUpdateRef.current = onSatelliteInfoUpdate;

  // Calculate satellite position
  const calculatePosition = useCallback(() => {
    try {
      if (!satellites || satellites.length === 0) {
        console.warn("No satellites available for position calculation");
        setIsLoading(false);
        return;
      }

      const tle = satellites[0].tle;
      if (!tle || !tle.line1 || !tle.line2) {
        console.warn("No TLE data available for satellite");
        setIsLoading(false);
        return;
      }

      const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
      const date = new Date();
      const positionAndVelocity = satellite.propagate(satrec, date);

      // Check if position and velocity exist and are objects (not booleans)
      if (
        positionAndVelocity.position &&
        typeof positionAndVelocity.position === "object" &&
        positionAndVelocity.velocity &&
        typeof positionAndVelocity.velocity === "object"
      ) {
        const gmst = satellite.gstime(date);
        const position = positionAndVelocity.position as EciVec3;
        const velocity = positionAndVelocity.velocity as EciVec3;

        // Convert the position to geodetic coordinates
        const geodeticCoordinates = satellite.eciToGeodetic(position, gmst);

        // Convert the coordinates to degrees
        const longitudeDeg = satellite.degreesLong(
          geodeticCoordinates.longitude
        );
        const latitudeDeg = satellite.degreesLat(geodeticCoordinates.latitude);

        // Calculate velocity magnitude in km/s
        const velocityMag = Math.sqrt(
          Math.pow(velocity.x, 2) +
            Math.pow(velocity.y, 2) +
            Math.pow(velocity.z, 2)
        );

        setViewState((prev) => ({
          ...prev,
          longitude: longitudeDeg,
          latitude: latitudeDeg,
        }));

        // Update satellite info for display
        const newSatelliteInfo = {
          altitude: geodeticCoordinates.height,
          velocity: velocityMag,
          latitude: latitudeDeg,
          longitude: longitudeDeg,
          timestamp: date,
        };
        
        setSatelliteInfo(newSatelliteInfo);
        onSatelliteInfoUpdateRef.current?.(newSatelliteInfo);

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error calculating satellite position:", error);
      setIsLoading(false);
    }
  }, [satellites]);

  useEffect(() => {
    // Calculate the initial position
    calculatePosition();

    // Update the position every 5 seconds
    const interval = setInterval(calculatePosition, 5000);

    return () => clearInterval(interval);
  }, [calculatePosition]);

  if (isLoading) {
    return <MapSkeleton />;
  }

  if (!satellites || satellites.length === 0) {
    return (
      <div className="h-full w-full relative">
        <div className="h-full w-full rounded-lg bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-600 mb-2">
              No Satellites Available
            </div>
            <div className="text-sm text-gray-500">
              No satellite data with TLE information found.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <Map
        {...viewState}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.5rem",
          backgroundColor: "rgb(0, 0, 0)",
        }}
        projection={"mercator"}
        interactive={true}
        mapStyle = {theme.theme === "dark"
          ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        }
        touchPitch={false}
        dragRotate={false}
        onMove={(evt) => setViewState(evt.viewState)}
      >
        {/* Add the satellite orbit when showOrbit is set to "orbit" */}
        {showOrbit === "orbit" && (
          <SatelliteOrbit
            tle={satellites[0].tle}
            date={satelliteInfo.timestamp}
            steps={360}
            color="#ff3333"
            width={2}
          />
        )}

        <SatelliteMarkers
          satellites={satellites}
          openPopupOnMount={false}
          subpixelPositioning={true}
          markerElement={
            <div className="relative">
              {/* Outer pulse animation */}
              <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-red-500/20 animate-ping" />
              {/* Inner pulse animation */}
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-red-500/30 animate-pulse" />
              {/* Satellite icon */}
              <div className="absolute -top-6 -left-6 w-12 h-12   rounded-full flex items-center justify-center z-10">
                <Image src={sat} width={64} height={64} alt="satellite" />
              </div>
            </div>
          }
        />

        {/* Ground Station Markers */}
        {groundStations.map((station) => (
          <Marker
            key={station.id}
            longitude={station.location.longitude}
            latitude={station.location.latitude}
            anchor="center"
          >
            <GroundStationMarker station={station} />
          </Marker>
        ))}
      </Map>
    </div>
  );
}

// Ground Station Marker Component
function GroundStationMarker({ station }: { station: GroundStation }) {
  return (
    <div className="relative cursor-pointer group">
      {/* Outer ring */}
      <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500" />
      {/* Inner circle */}
      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-blue-500" />
      {/* Center dot */}
      <div className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-white" />

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-20">
        {station.name}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}

// Skeleton loading component for the map
function MapSkeleton() {
  return (
    <div className="h-full w-full relative">
      <div className="h-full w-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
          <div className="h-3 w-36 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/80 backdrop-blur-xs p-4 rounded-lg shadow-lg w-64 h-64 animate-pulse">
          <div className="h-6 w-36 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-full bg-gray-300 rounded"></div>
            <div className="h-4 w-full bg-gray-300 rounded"></div>
          </div>
          <div className="flex gap-2 mt-4">
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
            <div className="h-8 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
