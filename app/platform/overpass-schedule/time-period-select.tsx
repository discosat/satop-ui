"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export type TimePeriod = 
  | "today"
  | "tomorrow"
  | "next-3-days"
  | "next-week"
  | "next-2-weeks"
  | "next-month";

interface TimePeriodSelectProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const TIME_PERIODS = [
  { value: "today" as TimePeriod, label: "Today" },
  { value: "tomorrow" as TimePeriod, label: "Tomorrow" },
  { value: "next-3-days" as TimePeriod, label: "Next 3 Days" },
  { value: "next-week" as TimePeriod, label: "Next Week" },
  { value: "next-2-weeks" as TimePeriod, label: "Next 2 Weeks" },
  { value: "next-month" as TimePeriod, label: "Next Month" },
];

export function TimePeriodSelect({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="time-period-select">Time Period</Label>
      <Select
        value={selectedPeriod}
        onValueChange={onPeriodChange}
        name="time-period-select"
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time period" />
        </SelectTrigger>
        <SelectContent>
          {TIME_PERIODS.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Utility function to get date range from time period
export function getDateRangeFromPeriod(period: TimePeriod): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  
  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 1);
      break;
    case "tomorrow":
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 1);
      break;
    case "next-3-days":
      end.setDate(end.getDate() + 3);
      break;
    case "next-week":
      end.setDate(end.getDate() + 7);
      break;
    case "next-2-weeks":
      end.setDate(end.getDate() + 14);
      break;
    case "next-month":
      end.setMonth(end.getMonth() + 1);
      break;
  }
  
  return { start, end };
}
