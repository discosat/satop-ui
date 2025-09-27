"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { GroundStation } from "@/app/api/platform/ground-stations/mock";

interface GroundStationSelectProps {
  groundStations: GroundStation[];
  selectedGroundStation: string;
  onGroundStationChange: (groundStationId: string) => void;
}

export function GroundStationSelect({
  groundStations,
  selectedGroundStation,
  onGroundStationChange,
}: GroundStationSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="ground-station-select">Ground Station</Label>
      <Select
        value={selectedGroundStation}
        onValueChange={onGroundStationChange}
        name="ground-station-select"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a ground station" />
        </SelectTrigger>
        <SelectContent>
          {groundStations.map((station) => (
            <SelectItem key={station.id} value={station.id.toString()}>
              {station.name} (Lat: {station.location.latitude.toFixed(2)}, Lon: {station.location.longitude.toFixed(2)}, Alt: {station.location.altitude}m)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
