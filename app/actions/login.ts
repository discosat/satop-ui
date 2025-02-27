"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login() {
  await createSession({
    userID: "1234",
    name: "Jenny",
    role: "admin",
    avatar: "martin.jpeg",
    email: "jenny@jenny.com",
    scopes: ["fp", "fp.view", "fp.code", "entities", "entities.overview"],
    accessToken: "access_token_placeholder",
    refreshToken: "refresh_token_placeholder",
  });

  redirect("/dashboard");
}
