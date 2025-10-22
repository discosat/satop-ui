"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Command } from "./command";
import { Download } from "lucide-react";

interface TriggerPipelineCommandProps {
  command: Command & { type: "TRIGGER_PIPELINE" };
  onUpdate: (updater: (cmd: Command) => Command) => void;
}

export function TriggerPipelineCommand({
  command,
  onUpdate,
}: TriggerPipelineCommandProps) {
  const updateExecutionTime = (executionTime: string) => {
    onUpdate((c) =>
      c.type === "TRIGGER_PIPELINE" ? { ...c, executionTime } : c
    );
  };

  const updateMode = (mode: number) => {
    onUpdate((c) =>
      c.type === "TRIGGER_PIPELINE" ? { ...c, mode } : c
    );
  };

  // Helper to format datetime-local input from ISO string
  const getDateTimeLocalValue = () => {
    try {
      const date = new Date(command.executionTime);
      // Format to YYYY-MM-DDTHH:mm (datetime-local format)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Helper to convert datetime-local input to ISO string
  const setDateTimeFromLocal = (value: string) => {
    try {
      const date = new Date(value);
      updateExecutionTime(date.toISOString());
    } catch {
      // Invalid date, ignore
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Download className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">Trigger Pipeline</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`execution-time-${command.id}`} className="text-xs">
            Execution Time
          </Label>
          <Input
            id={`execution-time-${command.id}`}
            type="datetime-local"
            value={getDateTimeLocalValue()}
            onChange={(e) => setDateTimeFromLocal(e.target.value)}
            className="h-9"
          />
          <p className="text-xs text-muted-foreground">
            ISO: {command.executionTime}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`mode-${command.id}`} className="text-xs">
            Mode
          </Label>
          <Select
            value={String(command.mode)}
            onValueChange={(value) => updateMode(parseInt(value))}
          >
            <SelectTrigger id={`mode-${command.id}`} className="h-9">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Mode 0</SelectItem>
              <SelectItem value="1">Mode 1</SelectItem>
              <SelectItem value="2">Mode 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
