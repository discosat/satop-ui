"use client";

import type React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { MapPin, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getImagingOpportunities } from "@/app/api/flight/flight-plan-service";

interface Coordinate {
  x: number;
  y: number;
}

interface CoordinateMapProps {
  onCoordinateSelect: (coordinate: Coordinate) => void;
  selectedCoordinate?: Coordinate;
  onClose?: () => void;
  dialogOpen?: boolean;
  satelliteId?: number;
}

export function CoordinateMap({
  onCoordinateSelect,
  selectedCoordinate,
  onClose,
  dialogOpen,
  satelliteId,
}: CoordinateMapProps) {
  const theme = useTheme();
  const [viewState, setViewState] = useState({
    longitude: selectedCoordinate?.x ?? 0,
    latitude: selectedCoordinate?.y ?? 20,
    zoom: selectedCoordinate ? 4 : 1.5,
  });
  const [hoveredCoord, setHoveredCoord] = useState<Coordinate | null>(null);
  const [validationState, setValidationState] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    error: string | null;
    imagingTime?: string;
    offNadirDegrees?: number;
  }>({
    isValidating: false,
    isValid: null,
    error: null,
  });
  const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidatedRef = useRef<{ lat: number; lon: number; satId: number } | null>(null);

  // Validation function
  const validateCoordinates = useCallback(async (
    latitude: number,
    longitude: number,
    satId: number
  ) => {
    // Check if we've already validated these exact coordinates
    if (
      lastValidatedRef.current &&
      lastValidatedRef.current.lat === latitude &&
      lastValidatedRef.current.lon === longitude &&
      lastValidatedRef.current.satId === satId
    ) {
      return; // Skip validation if coordinates haven't changed
    }

    try {
      setValidationState(prev => ({ ...prev, isValidating: true, error: null }));
      
      const result = await getImagingOpportunities({
        satelliteId: satId,
        targetLatitude: latitude,
        targetLongitude: longitude,
      });

      // Update last validated coordinates
      lastValidatedRef.current = { lat: latitude, lon: longitude, satId };

      if (result) {
        setValidationState({
          isValidating: false,
          isValid: true,
          error: null,
          imagingTime: result.imagingTime,
          offNadirDegrees: result.offNadirDegrees,
        });
      } else {
        setValidationState({
          isValidating: false,
          isValid: false,
          error: "Unable to image these coordinates with the selected satellite.",
        });
      }
    } catch (error) {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: error instanceof Error ? error.message : "Failed to validate coordinates.",
      });
    }
  }, []);

  // Effect to trigger debounced validation when coordinates change
  useEffect(() => {
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    if (!satelliteId || !selectedCoordinate) {
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
      });
      lastValidatedRef.current = null;
      return;
    }

    // Check if coordinates have actually changed
    if (
      lastValidatedRef.current &&
      lastValidatedRef.current.lat === selectedCoordinate.y &&
      lastValidatedRef.current.lon === selectedCoordinate.x &&
      lastValidatedRef.current.satId === satelliteId
    ) {
      return; // Skip if coordinates haven't changed
    }

    validationTimeoutRef.current = setTimeout(() => {
      validateCoordinates(
        selectedCoordinate.y,
        selectedCoordinate.x,
        satelliteId
      );
    }, 800);

    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [selectedCoordinate, satelliteId, validateCoordinates]);

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

          {/* Validation Status */}
          {satelliteId && selectedCoordinate && (
            <div className="mt-3">
              {validationState.isValidating && (
                <Alert className="border-blue-500/50 bg-blue-500/10">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <AlertDescription className="ml-2">
                    Validating coordinates...
                  </AlertDescription>
                </Alert>
              )}
              
              {!validationState.isValidating && validationState.isValid === true && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="ml-2">
                    <div className="space-y-1">
                      <div className="font-medium">Valid imaging opportunity</div>
                      {validationState.imagingTime && (
                        <div className="text-xs text-muted-foreground">
                          Imaging time: {new Date(validationState.imagingTime).toLocaleString()}
                        </div>
                      )}
                      {validationState.offNadirDegrees !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Off-nadir angle: {validationState.offNadirDegrees.toFixed(2)}°
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              {!validationState.isValidating && validationState.isValid === false && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="ml-2">
                    <div className="font-medium text-destructive">
                      {validationState.error || "Cannot image these coordinates"}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
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
  satelliteId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCoordinate?: Coordinate;
  onCoordinateSelect: (coordinate: Coordinate) => void;
  satelliteId?: number;
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
          satelliteId={satelliteId}
        />
      </DialogContent>
    </Dialog>
  );
}
