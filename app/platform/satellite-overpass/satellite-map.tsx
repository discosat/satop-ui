"use client";

import { useEffect, useState } from "react";
import { SatelliteMarkers, Satellite } from "react-sat-map";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "react-sat-map/style.css";
import * as satellite from "satellite.js";
import { SatelliteInfoCard } from "./satellite-info-card";
import { SatelliteOrbit } from "./satellite-orbit";
import Image from "next/image";
import sat from "@/public/assets/sat.svg";

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
}

export function SatelliteMap({ satellites }: SatelliteMapProps) {
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 0,
    zoom: 8,
  });
  const [satelliteInfo, setSatelliteInfo] = useState<SatelliteInfoType>({
    altitude: 0,
    velocity: 0,
    latitude: 0,
    longitude: 0,
    timestamp: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showOrbit, setShowOrbit] = useState<string>("orbit");

  // Manual refresh of satellite position
  const refreshPosition = () => {
    setIsLoading(true);
    calculatePosition();
    // Force orbital path to update by regenerating the timestamp
    setSatelliteInfo((prev) => ({
      ...prev,
      timestamp: new Date(),
    }));
    setTimeout(() => setIsLoading(false), 500); // Simulate loading for better UX
  };

  // Calculate satellite position
  const calculatePosition = () => {
    try {
      const tle = satellites[0].tle;
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

        // Update the view state to center on the satellite
        setViewState({
          longitude: longitudeDeg,
          latitude: latitudeDeg,
          zoom: 3,
        });

        // Update satellite info for display
        setSatelliteInfo({
          altitude: geodeticCoordinates.height,
          velocity: velocityMag,
          latitude: latitudeDeg,
          longitude: longitudeDeg,
          timestamp: date,
        });

        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error calculating satellite position:", error);
      setIsLoading(false);
    }
  };

  // Center on satellite without changing zoom
  const centerOnSatellite = () => {
    calculatePosition();
    // Don't change the zoom level to avoid disorienting the user
    setViewState((prev) => ({
      ...prev,
      longitude: satelliteInfo.longitude,
      latitude: satelliteInfo.latitude,
    }));
  };

  useEffect(() => {
    // Calculate the initial position
    calculatePosition();

    // Update the position every 5 seconds
    const interval = setInterval(calculatePosition, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return <MapSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <Map
        {...viewState}
        style={{
          height: "100%",
          width: "100%",
          borderRadius: "0.5rem",
        }}
        mapStyle="https://tile.openstreetmap.jp/styles/maptiler-basic-en/style.json"
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
      </Map>

      <div className="absolute top-4 right-4 z-10">
        <SatelliteInfoCard
          name={satellites[0].name}
          info={satelliteInfo}
          showOrbit={showOrbit}
          setShowOrbit={setShowOrbit}
          isLoading={isLoading}
          refreshPosition={refreshPosition}
          centerOnSatellite={centerOnSatellite}
        />
      </div>
    </div>
  );
}

// Skeleton loading component for the map
function MapSkeleton() {
  return (
    <div className="flex-1 flex flex-col relative">
      <div className="h-full w-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse"></div>
          <div className="h-4 w-48 bg-gray-300 rounded"></div>
          <div className="h-3 w-36 bg-gray-300 rounded"></div>
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg w-64 h-64 animate-pulse">
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
