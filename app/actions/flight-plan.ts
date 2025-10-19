"use server";

import { revalidatePath } from "next/cache";

// Server action to refresh flight plans data
export async function refreshFlightPlans() {
  revalidatePath("/platform/flight");
  return { success: true };
}
