"use client";

import { RefreshButton } from "@/components/refresh-button";
import { refreshGroundStations } from "@/app/actions/ground-stations";

export function ServerRefreshButton() {
  const handleRefresh = () => {
    refreshGroundStations();
  };

  return <RefreshButton onClick={handleRefresh} />;
}
