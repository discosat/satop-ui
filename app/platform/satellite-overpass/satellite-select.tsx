"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Satellite } from "react-sat-map";

interface SatelliteSelectProps {
  satellites: Satellite[];
  selectedSatellite: string;
  onSatelliteChange: (satellite: string) => void;
}

export function SatelliteSelect({
  satellites,
  selectedSatellite,
  onSatelliteChange,
}: SatelliteSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="satellite-select">Satellite</Label>
      <Select
        value={selectedSatellite}
        onValueChange={onSatelliteChange}
        name="satellite-select"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a satellite" />
        </SelectTrigger>
        <SelectContent>
          {satellites.map((satellite) => (
            <SelectItem key={satellite.name} value={satellite.name}>
              {satellite.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
