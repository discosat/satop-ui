"use server";
import { currentSession } from "@/lib/session";

export async function me() {
  return await currentSession();
}
