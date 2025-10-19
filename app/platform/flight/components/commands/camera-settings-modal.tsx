"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CameraSettings } from "./command";
import { Settings } from "lucide-react";

interface CameraSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CameraSettings;
  onSettingsChange: (settings: CameraSettings) => void;
}

export function CameraSettingsModal({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
}: CameraSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<CameraSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, open]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings); // Reset to original settings
    onOpenChange(false);
  };

  const updateLocalSettings = (updates: Partial<CameraSettings>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Camera Settings
          </DialogTitle>
          <DialogDescription>
            Configure detailed camera settings for image capture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cameraId">Camera ID</Label>
              <Input
                id="cameraId"
                value={localSettings.cameraId}
                onChange={(e) => updateLocalSettings({ cameraId: e.target.value })}
                placeholder="e.g., 1800 U-500c"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Camera Type</Label>
              <Select
                value={String(localSettings.type)}
                onValueChange={(value) =>
                  updateLocalSettings({ type: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">VMB (Type 0)</SelectItem>
                  <SelectItem value="1">IR (Type 1)</SelectItem>
                  <SelectItem value="2">Test (Type 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exposureMicroseconds">
                Exposure (μs)
                <span className="text-xs text-muted-foreground ml-1">
                  (microseconds)
                </span>
              </Label>
              <Input
                id="exposureMicroseconds"
                type="number"
                min="0"
                value={localSettings.exposureMicroseconds}
                onChange={(e) =>
                  updateLocalSettings({
                    exposureMicroseconds: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                placeholder="55000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iso">
                ISO
                <span className="text-xs text-muted-foreground ml-1">
                  (sensitivity)
                </span>
              </Label>
              <Input
                id="iso"
                type="number"
                min="0"
                value={localSettings.iso}
                onChange={(e) =>
                  updateLocalSettings({
                    iso: Math.max(0, parseInt(e.target.value) || 1),
                  })
                }
                placeholder="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numImages">
                Number of Images
                <span className="text-xs text-muted-foreground ml-1">
                  (count)
                </span>
              </Label>
              <Input
                id="numImages"
                type="number"
                min="1"
                value={localSettings.numImages}
                onChange={(e) =>
                  updateLocalSettings({
                    numImages: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                placeholder="5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="intervalMicroseconds">
                Interval (μs)
                <span className="text-xs text-muted-foreground ml-1">
                  (between images)
                </span>
              </Label>
              <Input
                id="intervalMicroseconds"
                type="number"
                min="0"
                value={localSettings.intervalMicroseconds}
                onChange={(e) =>
                  updateLocalSettings({
                    intervalMicroseconds: Math.max(0, parseInt(e.target.value) || 0),
                  })
                }
                placeholder="1000000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="observationId">
                Observation ID
              </Label>
              <Input
                id="observationId"
                type="number"
                min="1"
                value={localSettings.observationId}
                onChange={(e) =>
                  updateLocalSettings({
                    observationId: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pipelineId">
                Pipeline ID
              </Label>
              <Input
                id="pipelineId"
                type="number"
                min="1"
                value={localSettings.pipelineId}
                onChange={(e) =>
                  updateLocalSettings({
                    pipelineId: Math.max(1, parseInt(e.target.value) || 1),
                  })
                }
                placeholder="1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
