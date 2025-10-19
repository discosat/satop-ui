"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Command, CameraSettings } from "./command";
import { CameraSettingsModal } from "./camera-settings-modal";
import { Camera, Map, Settings } from "lucide-react";

interface TriggerCaptureCommandProps {
  command: Command & { type: "TRIGGER_CAPTURE" };
  onUpdate: (updater: (cmd: Command) => Command) => void;
  onOpenMap?: () => void;
}

export function TriggerCaptureCommand({
  command,
  onUpdate,
  onOpenMap,
}: TriggerCaptureCommandProps) {
  const [configModalOpen, setConfigModalOpen] = useState(false);

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

  const updateMaxOffNadirDegrees = (value: number) => {
    onUpdate((c) =>
      c.type === "TRIGGER_CAPTURE"
        ? { ...c, maxOffNadirDegrees: value }
        : c
    );
  };

  const updateMaxSearchDurationHours = (value: number) => {
    onUpdate((c) =>
      c.type === "TRIGGER_CAPTURE"
        ? { ...c, maxSearchDurationHours: value }
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

        {/* Additional Parameters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`nadir-${command.id}`} className="text-xs">
              Max Off-Nadir (degrees)
            </Label>
            <Input
              id={`nadir-${command.id}`}
              type="number"
              min="0"
              max="90"
              value={command.maxOffNadirDegrees}
              onChange={(e) =>
                updateMaxOffNadirDegrees(parseFloat(e.target.value) || 0)
              }
              placeholder="10"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`duration-${command.id}`} className="text-xs">
              Max Search Duration (hours)
            </Label>
            <Input
              id={`duration-${command.id}`}
              type="number"
              min="0"
              value={command.maxSearchDurationHours}
              onChange={(e) =>
                updateMaxSearchDurationHours(parseFloat(e.target.value) || 0)
              }
              placeholder="48"
              className="h-9"
            />
          </div>
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
