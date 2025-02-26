"use server";
import { destroySession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function logout() {
  await destroySession();
  redirect("/login");
}
