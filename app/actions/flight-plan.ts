"use server";

import { revalidatePath } from "next/cache";
import { FlightPlan } from "../platform/flight/flight-table";
import { getFlightPlans as fetchFlightPlans } from "@/app/api/platform/flight/flight-plan-service";


// Server action to refresh flight plans data
export async function refreshFlightPlans() {
  revalidatePath("/platform/flight");
  return { success: true };
}

// Server action to search flight plans
export async function searchFlightPlans(query: string): Promise<FlightPlan[]> {
  const plans = await fetchFlightPlans();
  
  if (!query) return plans;
  
  const lowerQuery = query.toLowerCase();
  return plans.filter(plan => 
    plan.flight_plan.name.toLowerCase().includes(lowerQuery) || 
    plan.sat_name.toLowerCase().includes(lowerQuery) ||
    plan.gs_id.toLowerCase().includes(lowerQuery)
  );
}