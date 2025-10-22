"use client";

// DEPRECATED: This file is no longer used. Use trigger-pipeline-command.tsx instead.
// Kept for backward compatibility.

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

// Legacy type
type Command = {
  type: "INITIATE_DOWNLINK";
  id: string;
  flightId: string;
};

interface InitiateDownlinkCommandProps {
  command: Command;
  onUpdate: (updater: (cmd: Command) => Command) => void;
}

export function InitiateDownlinkCommand({
  command,
  onUpdate,
}: InitiateDownlinkCommandProps) {
  const updateFlightId = (flightId: string) => {
    onUpdate((c) =>
      c.type === "INITIATE_DOWNLINK" ? { ...c, flightId } : c
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Initiate Downlink</h4>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`flight-${command.id}`} className="text-xs">
          Flight ID
        </Label>
        <Input
          id={`flight-${command.id}`}
          value={command.flightId}
          onChange={(e) => updateFlightId(e.target.value)}
          placeholder="Enter flight ID"
          className="h-9"
        />
      </div>
    </div>
  );
}