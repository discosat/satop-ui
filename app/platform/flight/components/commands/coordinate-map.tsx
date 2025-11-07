"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  ScaleControl,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, X } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Coordinate {
  x: number;
  y: number;
}

interface CoordinateMapProps {
  onCoordinateSelect: (coordinate: Coordinate) => void;
  selectedCoordinate?: Coordinate;
  onClose?: () => void;
  dialogOpen?: boolean;
}

export function CoordinateMap({
  onCoordinateSelect,
  selectedCoordinate,
  onClose,
  dialogOpen,
}: CoordinateMapProps) {
  const theme = useTheme();
  const [viewState, setViewState] = useState({
    longitude: selectedCoordinate?.x ?? 0,
    latitude: selectedCoordinate?.y ?? 20,
    zoom: selectedCoordinate ? 4 : 1.5,
  });
  const [hoveredCoord, setHoveredCoord] = useState<Coordinate | null>(null);

  // Reset view to fully zoomed out when dialog opens
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (dialogOpen) {
      setViewState({ longitude: 0, latitude: 20, zoom: 1.0 });
    }
  }, [dialogOpen]);

  // Update marker when selected coordinate changes
  useEffect(() => {
    if (selectedCoordinate) {
      setViewState((prev) => ({
        ...prev,
        longitude: selectedCoordinate.x,
        latitude: selectedCoordinate.y,
        zoom: Math.max(prev.zoom, 4),
      }));
    }
  }, [selectedCoordinate]);

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Select Coordinates
            </CardTitle>
            <CardDescription>
              Click on the map to select target coordinates for imaging
            </CardDescription>
          </div>
          {onClose && (
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="w-full h-96 rounded-lg border border-border overflow-hidden">
            <Map
              {...viewState}
              style={{
                height: "24rem",
                width: "100%",
                borderRadius: "0.5rem",
                backgroundColor: "rgb(0,0,0)",
              }}
              projection={"mercator"}
              interactive={true}
              mapStyle={
                theme.theme === "dark"
                  ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                  : "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              }
              dragRotate={false}
              touchPitch={false}
              onMove={(evt) => setViewState(evt.viewState)}
              onMouseMove={(evt) => {
                const { lng, lat } = evt.lngLat;
                setHoveredCoord({
                  x: Number(lng.toFixed(4)),
                  y: Number(lat.toFixed(4)),
                });
              }}
              onMouseOut={() => setHoveredCoord(null)}
              onClick={(evt) => {
                const { lng, lat } = evt.lngLat;
                onCoordinateSelect({
                  x: Number(lng.toFixed(4)),
                  y: Number(lat.toFixed(4)),
                });
              }}
            >
              <NavigationControl position="top-left" visualizePitch={false} />
              <ScaleControl position="bottom-left" unit="metric" />
              {selectedCoordinate && (
                <Marker
                  longitude={selectedCoordinate.x}
                  latitude={selectedCoordinate.y}
                  anchor="center"
                >
                  <div style={{ position: "relative", width: 40, height: 40 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background:
                          "radial-gradient(circle, rgba(59,130,246,0.6) 0%, rgba(59,130,246,0) 70%)",
                        borderRadius: "50%",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        animation: "coord-pulse 2s ease-in-out infinite",
                      }}
                    />
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#3b82f6"
                      stroke="white"
                      strokeWidth="2"
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                      }}
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <style>{`@keyframes coord-pulse {0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.1);opacity:.3}}`}</style>
                  </div>
                </Marker>
              )}
            </Map>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-6">
              {selectedCoordinate && (
                <>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>{" "}
                    <span className="font-mono font-semibold">
                      {selectedCoordinate.x}°
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>{" "}
                    <span className="font-mono font-semibold">
                      {selectedCoordinate.y}°
                    </span>
                  </div>
                </>
              )}
              {!selectedCoordinate && (
                <span className="text-muted-foreground">
                  Click on the map to select coordinates
                </span>
              )}
            </div>
            {hoveredCoord && (
              <div className="text-muted-foreground text-xs">
                Hover: {hoveredCoord.x}°, {hoveredCoord.y}°
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dialog-wrapped coordinate map to simplify usage by consumers
export function CoordinateMapDialog({
  open,
  onOpenChange,
  selectedCoordinate,
  onCoordinateSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCoordinate?: Coordinate;
  onCoordinateSelect: (coordinate: Coordinate) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Select Target Coordinates</DialogTitle>
          <DialogDescription>
            Click on the map to set the imaging target location
          </DialogDescription>
        </DialogHeader>
        <CoordinateMap
          dialogOpen={open}
          selectedCoordinate={selectedCoordinate}
          onCoordinateSelect={onCoordinateSelect}
        />
      </DialogContent>
    </Dialog>
  );
}
