"use client";

import { useEffect, useState } from "react";
import * as satellite from "satellite.js";
import { Layer, Source } from "react-map-gl/maplibre";

// Define TLE type since it's not exported from react-sat-map
interface TLE {
  line1: string;
  line2: string;
}

interface SatelliteOrbitProps {
  tle: TLE;
  date: Date;
  steps?: number;
  color?: string;
  width?: number;
}

export function SatelliteOrbit({
  tle,
  date,
  steps = 90,
  color = "#e77d5d",
  width = 2,
}: SatelliteOrbitProps) {
  const [segments, setSegments] = useState<Array<Array<[number, number]>>>([]);

  //Tailwind red-500 to hex #ff3333

  // Calculate the orbit path
  useEffect(() => {
    try {
      // Parse TLE data
      const satrec = satellite.twoline2satrec(tle.line1, tle.line2);

      // Calculate orbit period in minutes
      const orbitPeriod = (2 * Math.PI) / satrec.no; // Minutes per orbit

      // Calculate step size in milliseconds
      const stepMilliseconds = (orbitPeriod / steps) * 60 * 1000;

      // First, get all raw coordinates
      const rawCoordinates: Array<{ longitude: number; latitude: number }> = [];

      // Calculate positions for one complete orbit
      for (let i = 0; i <= steps; i++) {
        const stepDate = new Date(date.getTime() + i * stepMilliseconds);

        // Get satellite position
        const { position } = satellite.propagate(satrec, stepDate);

        // Skip if position is not available
        if (typeof position === "boolean") {
          continue;
        }

        // Convert ECI position to geodetic coordinates
        const gmst = satellite.gstime(stepDate);
        const geodetic = satellite.eciToGeodetic(position, gmst);

        // Convert to degrees
        const longitude = satellite.degreesLong(geodetic.longitude);
        const latitude = satellite.degreesLat(geodetic.latitude);

        rawCoordinates.push({ longitude, latitude });
      }

      // Now process the raw coordinates to handle the antimeridian correctly
      // We'll split the orbit into segments at the antimeridian to avoid horizontal lines
      const orbitSegments: Array<Array<[number, number]>> = [];
      let currentSegment: Array<[number, number]> = [];

      for (let i = 0; i < rawCoordinates.length; i++) {
        const current = rawCoordinates[i];

        // Add the first point to the current segment
        if (i === 0) {
          currentSegment.push([current.longitude, current.latitude]);
          continue;
        }

        const prev = rawCoordinates[i - 1];

        // Check if we're crossing the antimeridian
        const isAntimerCrossing =
          Math.abs(current.longitude - prev.longitude) > 180;

        if (isAntimerCrossing) {
          // End the current segment
          if (currentSegment.length > 0) {
            orbitSegments.push(currentSegment);
          }

          // Start a new segment
          currentSegment = [[current.longitude, current.latitude]];
        } else {
          // Continue the current segment
          currentSegment.push([current.longitude, current.latitude]);
        }
      }

      // Add the last segment if not empty
      if (currentSegment.length > 0) {
        orbitSegments.push(currentSegment);
      }

      setSegments(orbitSegments);
    } catch (error) {
      console.error("Error calculating satellite orbit:", error);
    }
  }, [tle, date, steps]);

  // Skip rendering if we don't have segments
  if (segments.length === 0) {
    return null;
  }

  // Create GeoJSON object with multiple features (one for each segment)
  const geojson = {
    type: "FeatureCollection" as const,
    features: segments.map((segment) => ({
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: segment,
      },
    })),
  };

  return (
    <Source id="satellite-orbit-source" type="geojson" data={geojson}>
      <Layer
        id="satellite-orbit-layer"
        type="line"
        source="satellite-orbit-source"
        layout={{
          "line-join": "round",
          "line-cap": "round",

          visibility: "visible",
        }}
        paint={{
          "line-color": color,
          "line-width": width,
          "line-opacity": 0.8,
          "line-dasharray": [0, 4, 3],
        }}
      />
    </Source>
  );
}
