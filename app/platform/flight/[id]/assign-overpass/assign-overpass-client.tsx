"use client";

import { useState } from "react";
import type { GroundStation } from "@/app/api/ground-stations/types";
import { TimePeriodSelect, TimePeriod } from "@/app/platform/overpass-schedule/time-period-select";
import { RefreshButton } from "@/components/refresh-button";
import { Separator } from "@/components/ui/separator";
import { Rocket } from "lucide-react";
import { OverpassAssignmentCalendar } from "./overpass-assignment-calendar";
import type { Satellite } from "react-sat-map";

interface AssignOverpassClientProps {
  satellite: Satellite & { id: number };
  groundStation: GroundStation;
  flightPlanId: number;
  onAssignmentComplete: () => void;
}

export function AssignOverpassClient({
  satellite,
  groundStation,
  flightPlanId,
  onAssignmentComplete,
}: AssignOverpassClientProps) {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>("next-3-days");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    console.log("[AssignOverpassClient] Manual refresh triggered");
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0">
        <TimePeriodSelect
          selectedPeriod={selectedTimePeriod}
          onPeriodChange={setSelectedTimePeriod}
        />
        <div className="flex items-end">
          <RefreshButton onClick={handleRefresh} />
        </div>
      </div>

      <Separator />

      {/* Content Section - Full width for overpass calendar */}
      <div className="flex flex-col flex-1 min-h-0">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 flex-shrink-0">
          <Rocket className="h-5 w-5 text-blue-500" />
          Select Overpass Window
        </h3>
        {/* <div className="flex-1 min-h-0"> */}
            {/* <div>Wtf</div> */}
            {/* <div>Wtf</div> */}
            

          <OverpassAssignmentCalendar
            key={`calendar-${refreshKey}`}
            satellite={satellite}
            groundStation={groundStation}
            timePeriod={selectedTimePeriod}
            flightPlanId={flightPlanId}
            onAssignmentComplete={onAssignmentComplete}
          />
        {/* </div> */}
      </div>
    </div>
  );
}
