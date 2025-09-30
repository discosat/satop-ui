"use server";

import { revalidatePath } from "next/cache";
import { FlightPlan, getFlightPlans as fetchFlightPlans } from "@/app/api/platform/flight/flight-plan-service";


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
    plan.flightPlanBody.name.toLowerCase().includes(lowerQuery) || 
    plan.satId.toString().includes(lowerQuery) ||
    plan.gsId.toString().includes(lowerQuery)
  );
}