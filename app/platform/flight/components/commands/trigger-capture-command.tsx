"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Command, CameraSettings } from "./command";
import { CameraSettingsModal } from "./camera-settings-modal";
import { Camera, Map, Settings, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { getImagingOpportunities } from "@/app/api/flight/flight-plan-service";

interface TriggerCaptureCommandProps {
  command: Command & { type: "TRIGGER_CAPTURE" };
  onUpdate: (updater: (cmd: Command) => Command) => void;
  onOpenMap?: () => void;
  satelliteId?: number;
}

export function TriggerCaptureCommand({
  command,
  onUpdate,
  onOpenMap,
  satelliteId,
}: TriggerCaptureCommandProps) {
  const [configModalOpen, setConfigModalOpen] = useState(false);
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

  // Debounced validation function
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

  // Effect to trigger debounced validation when coordinates or satellite change
  useEffect(() => {
    // Clear any existing timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Only validate if we have a satellite ID
    if (!satelliteId) {
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
      lastValidatedRef.current.lat === command.captureLocation.latitude &&
      lastValidatedRef.current.lon === command.captureLocation.longitude &&
      lastValidatedRef.current.satId === satelliteId
    ) {
      return; // Skip if coordinates haven't changed
    }

    // Debounce the validation call by 800ms
    validationTimeoutRef.current = setTimeout(() => {
      validateCoordinates(
        command.captureLocation.latitude,
        command.captureLocation.longitude,
        satelliteId
      );
    }, 800);

    // Cleanup timeout on unmount
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [command.captureLocation.latitude, command.captureLocation.longitude, satelliteId, validateCoordinates]);

  const updateCaptureLocation = (field: "latitude" | "longitude", value: number) => {
    onUpdate((c) =>
      c.type === "TRIGGER_CAPTURE"
        ? {
            ...c,
            captureLocation: {
              ...c.captureLocation,
              [field]: value,
            },
          }
        : c
    );
  };

  const updateCameraSettings = (newSettings: CameraSettings) => {
    onUpdate((c) =>
      c.type === "TRIGGER_CAPTURE"
        ? {
            ...c,
            cameraSettings: newSettings,
          }
        : c
    );
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">Trigger Capture</h4>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfigModalOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure Camera
          </Button>
        </div>

        {/* Basic camera info display */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {command.cameraSettings.cameraId}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Type: {command.cameraSettings.type === 0 ? "VMB" : command.cameraSettings.type === 1 ? "IR" : "Test"}
          </Badge>
          {command.cameraSettings.numImages > 1 && (
            <Badge variant="outline" className="text-xs">
              {command.cameraSettings.numImages} images
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            Obs ID: {command.cameraSettings.observationId}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Pipeline ID: {command.cameraSettings.pipelineId}
          </Badge>
        </div>

        {/* Capture Location */}
        <div className="space-y-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`lat-${command.id}`} className="text-xs">
                Latitude
              </Label>
              <Input
                id={`lat-${command.id}`}
                type="number"
                step="0.000001"
                value={command.captureLocation.latitude}
                onChange={(e) =>
                  updateCaptureLocation("latitude", parseFloat(e.target.value) || 0)
                }
                placeholder="55.6761"
                className="h-9"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={`lon-${command.id}`} className="text-xs">
                Longitude
              </Label>
              <Input
                id={`lon-${command.id}`}
                type="number"
                step="0.000001"
                value={command.captureLocation.longitude}
                onChange={(e) =>
                  updateCaptureLocation("longitude", parseFloat(e.target.value) || 0)
                }
                placeholder="12.5683"
                className="h-9"
              />
            </div>
            {onOpenMap && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenMap}
                className="bg-transparent h-9 px-3"
              >
                <Map className="h-4 w-4 mr-2" />
                Select on Map
              </Button>
            )}
          </div>

          {/* Validation Status */}
          {satelliteId && (
            <div className="mt-2">
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
      </div>

      <CameraSettingsModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        settings={command.cameraSettings}
        onSettingsChange={updateCameraSettings}
      />
    </>
  );
}
