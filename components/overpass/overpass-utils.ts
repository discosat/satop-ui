import type { TimePeriod } from "@/app/platform/overpass-schedule/time-period-select";
import type { Overpass } from "@/app/api/overpass/types";

/**
 * Convert time period to date range
 */
export function getDateRangeFromPeriod(
  period: TimePeriod
): { start: Date; end: Date } {
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

/**
 * Format time for display (HH:MM format)
 */
export function formatTime(dateString: string, isMounted: boolean): string {
  if (!isMounted) return "";
  const date = new Date(dateString);
  return date.toLocaleTimeString("da-DK", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Calculate duration between two times in minutes
 */
export function getDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / (60 * 1000));
}

/**
 * Check if overpass is currently happening
 */
export function isHappeningNow(startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
}

/**
 * Determine pass quality based on elevation
 */
export function getPassQuality(elevation: number): {
  quality: string;
  variant: "default" | "secondary" | "outline";
  color: string;
} {
  if (elevation >= 60)
    return {
      quality: "Excellent",
      variant: "default",
      color: "text-green-700 bg-green-100 border-green-200",
    };
  if (elevation >= 40)
    return {
      quality: "Great",
      variant: "default",
      color: "text-blue-700 bg-blue-100 border-blue-200",
    };
  if (elevation >= 25)
    return {
      quality: "Good",
      variant: "secondary",
      color: "text-orange-700 bg-orange-100 border-orange-200",
    };
  if (elevation >= 15)
    return {
      quality: "Fair",
      variant: "outline",
      color: "text-yellow-700 bg-yellow-100 border-yellow-200",
    };
  return {
    quality: "Poor",
    variant: "outline",
    color: "text-red-700 bg-red-100 border-red-200",
  };
}

/**
 * Group overpasses by date
 */
export function groupOverpassesByDate(passes: Overpass[]): {
  [key: string]: Overpass[];
} {
  const groups: { [key: string]: Overpass[] } = {};

  passes.forEach((pass) => {
    const date = new Date(pass.startTime);
    const dateKey = date.toDateString();

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(pass);
  });

  return groups;
}

/**
 * Format date header for display (Today, Tomorrow, or full date)
 */
export function formatDateHeader(dateString: string, isMounted: boolean): string {
  if (!isMounted) return "";

  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  } else {
    return date.toLocaleDateString("da-DK", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
}
