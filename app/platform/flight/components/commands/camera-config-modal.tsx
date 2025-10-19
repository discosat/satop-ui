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
import { Settings } from "lucide-react";

// Legacy interface - this component is deprecated, use camera-settings-modal instead
interface CameraConfig {
  cameraID: string;
  cameraType: "VMB" | "IR" | "Test";
  exposure: number;
  iso: number;
  numOfImages: number;
  interval: number;
}

interface CameraConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: CameraConfig;
  onConfigChange: (config: CameraConfig) => void;
}

export function CameraConfigModal({
  open,
  onOpenChange,
  config,
  onConfigChange,
}: CameraConfigModalProps) {
  const [localConfig, setLocalConfig] = useState<CameraConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config, open]);

  const handleSave = () => {
    onConfigChange(localConfig);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setLocalConfig(config); // Reset to original config
    onOpenChange(false);
  };

  const updateLocalConfig = (updates: Partial<CameraConfig>) => {
    setLocalConfig((prev: CameraConfig) => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Camera Configuration
          </DialogTitle>
          <DialogDescription>
            Configure detailed camera settings for image capture.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cameraID">Camera ID</Label>
              <Input
                id="cameraID"
                value={localConfig.cameraID}
                onChange={(e) => updateLocalConfig({ cameraID: e.target.value })}
                placeholder="e.g., 1800 U-500c"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cameraType">Camera Type</Label>
              <Select
                value={localConfig.cameraType}
                onValueChange={(value: "VMB" | "IR" | "Test") =>
                  updateLocalConfig({ cameraType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VMB">VMB</SelectItem>
                  <SelectItem value="IR">IR</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exposure">
                Exposure (μs)
                <span className="text-xs text-muted-foreground ml-1">
                  (0 - 2,000,000)
                </span>
              </Label>
              <Input
                id="exposure"
                type="number"
                min="0"
                max="2000000"
                value={localConfig.exposure}
                onChange={(e) =>
                  updateLocalConfig({
                    exposure: Math.max(
                      0,
                      Math.min(2000000, parseInt(e.target.value) || 0)
                    ),
                  })
                }
                placeholder="1000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iso">
                ISO Sensitivity
                <span className="text-xs text-muted-foreground ml-1">
                  (0.1 - 10.0)
                </span>
              </Label>
              <Input
                id="iso"
                type="number"
                step="0.1"
                min="0.1"
                max="10.0"
                value={localConfig.iso}
                onChange={(e) =>
                  updateLocalConfig({
                    iso: Math.max(
                      0.1,
                      Math.min(10.0, parseFloat(e.target.value) || 0.1)
                    ),
                  })
                }
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numOfImages">
                Number of Images
                <span className="text-xs text-muted-foreground ml-1">
                  (1 - 1000)
                </span>
              </Label>
              <Input
                id="numOfImages"
                type="number"
                min="1"
                max="1000"
                value={localConfig.numOfImages}
                onChange={(e) =>
                  updateLocalConfig({
                    numOfImages: Math.max(
                      1,
                      Math.min(1000, parseInt(e.target.value) || 1)
                    ),
                  })
                }
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interval">
                Interval (μs)
                <span className="text-xs text-muted-foreground ml-1">
                  (0 - 60,000,000)
                </span>
              </Label>
              <Input
                id="interval"
                type="number"
                min="0"
                max="60000000"
                value={localConfig.interval}
                onChange={(e) =>
                  updateLocalConfig({
                    interval: Math.max(
                      0,
                      Math.min(60000000, parseInt(e.target.value) || 0)
                    ),
                  })
                }
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}