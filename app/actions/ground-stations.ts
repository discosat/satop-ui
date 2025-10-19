"use server";

import { revalidatePath } from "next/cache";

export async function refreshGroundStations() {
  revalidatePath("/platform/ground-stations");
  return { success: true };
}