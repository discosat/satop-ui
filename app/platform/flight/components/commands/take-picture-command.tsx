"use client";

// DEPRECATED: This file is no longer used. Use trigger-capture-command.tsx instead.
// Kept for backward compatibility.

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CameraConfigModal } from "./camera-config-modal";
import { Camera, Map, Settings } from "lucide-react";

// Legacy types
type Command = {
  type: "TAKE_PICTURE";
  id: string;
  coordinates: { x: number; y: number };
  cameraConfig: {
    cameraID: string;
    cameraType: "VMB" | "IR" | "Test";
    exposure: number;
    iso: number;
    numOfImages: number;
    interval: number;
  };
};

interface TakePictureCommandProps {
  command: Command;
  onUpdate: (updater: (cmd: Command) => Command) => void;
  onOpenMap?: () => void;
}

export function TakePictureCommand({
  command,
  onUpdate,
  onOpenMap,
}: TakePictureCommandProps) {
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const updateCoordinates = (field: "x" | "y", value: number) => {
    onUpdate((c) =>
      c.type === "TAKE_PICTURE"
        ? {
            ...c,
            coordinates: {
              ...c.coordinates,
              [field]: value,
            },
          }
        : c
    );
  };

  const updateCameraConfig = (newConfig: Command['cameraConfig']) => {
    onUpdate((c) =>
      c.type === "TAKE_PICTURE"
        ? {
            ...c,
            cameraConfig: newConfig,
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
            <h4 className="font-semibold">Take Picture</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfigModalOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>

        {/* Basic camera info display */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            {command.cameraConfig.cameraID}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {command.cameraConfig.cameraType}
          </Badge>
          {command.cameraConfig.numOfImages > 1 && (
            <Badge variant="outline" className="text-xs">
              {command.cameraConfig.numOfImages} images
            </Badge>
          )}
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`x-${command.id}`} className="text-xs">
              Longitude (X)
            </Label>
            <Input
              id={`x-${command.id}`}
              type="number"
              value={command.coordinates.x}
              onChange={(e) =>
                updateCoordinates("x", parseFloat(e.target.value) || 0)
              }
              placeholder="0.0"
              className="h-9"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor={`y-${command.id}`} className="text-xs">
              Latitude (Y)
            </Label>
            <Input
              id={`y-${command.id}`}
              type="number"
              value={command.coordinates.y}
              onChange={(e) =>
                updateCoordinates("y", parseFloat(e.target.value) || 0)
              }
              placeholder="0.0"
              className="h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMap}
            className="bg-transparent h-9 px-3"
          >
            <Map className="h-4 w-4 mr-2" />
            Select on Map
          </Button>
        </div>
      </div>

      <CameraConfigModal
        open={configModalOpen}
        onOpenChange={setConfigModalOpen}
        config={command.cameraConfig}
        onConfigChange={updateCameraConfig}
      />
    </>
  );
}