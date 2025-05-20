"use client";

import { RefreshButton } from "@/components/refresh-button";
import { refreshFlightPlans } from "@/app/actions/flight-plan";

export function ServerRefreshButton() {
  
  
  const handleRefresh = () => {
       refreshFlightPlans();
  };
  
  return (
    <RefreshButton 
      onClick={handleRefresh} 
    />
  );
}