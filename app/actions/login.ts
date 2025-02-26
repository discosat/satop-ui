"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login() {
  // TODO: Actually implement WAYF login at some point.
  await createSession({
    userID: "1234",
    name: "Jenny",
    role: "admin",
    avatar: "martin.jpeg",
    scopes: new Set("flight_plan.create"),
    accessToken: "access_token_placeholder",
    refreshToken: "refresh_token_placeholder",
  });
  redirect("/dashboard");
}
