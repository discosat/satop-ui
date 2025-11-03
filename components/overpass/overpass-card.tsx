"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ArrowUpRight } from "lucide-react";
import {
  formatTime,
  getDuration,
  isHappeningNow,
  getPassQuality,
} from "./overpass-utils";
import type { Overpass } from "@/app/api/overpass/types";

interface OverpassCardProps {
  overpass: Overpass;
  passNumber: number;
  isMounted: boolean;
  onClick?: () => void;
  rightContent?: React.ReactNode;
}

export function OverpassCard({
  overpass,
  passNumber,
  isMounted,
  onClick,
  rightContent,
}: OverpassCardProps) {
  const isNow = isHappeningNow(overpass.startTime, overpass.endTime);
  const passQuality = getPassQuality(overpass.maxElevation);
  const duration = getDuration(overpass.startTime, overpass.endTime);

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        onClick ? "cursor-pointer hover:border-primary/50" : ""
      } ${isNow ? "ring-2 ring-primary ring-offset-2" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Time window */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {isNow && <ArrowUpRight className="h-4 w-4 text-primary" />}
              <div className="text-sm font-medium">Pass #{passNumber}</div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono">
                  {formatTime(overpass.startTime, isMounted)} -{" "}
                  {formatTime(overpass.endTime, isMounted)}
                </span>
              </div>
              <div className="text-muted-foreground">({duration} min)</div>
            </div>
          </div>

          {/* Right side - Elevation and quality */}
          <div className="flex items-center gap-3">
            {rightContent}
            <div className="text-right">
              <div className="text-sm font-medium">
                {overpass.maxElevation.toFixed(1)}° max
              </div>
              <div className="text-xs text-muted-foreground">
                at {formatTime(overpass.maxElevationTime, isMounted)}
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${passQuality.color} border font-medium`}
            >
              {passQuality.quality}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
