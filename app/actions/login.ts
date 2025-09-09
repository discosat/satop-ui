"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(email: string, password: string) {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    await createSession({
      userID: "mock-admin-id-123",
      name: "Mock Admin",
      avatar: "/assets/default-avatar.png",
      role: "admin",
      email: email,

      scopes: ["*"], 
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    });

    redirect("/platform");
  }

  try {
    const response = await fetch("http://localhost:7889/api/plugins/login/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error("Login failed:", await response.text());
      return { error: "Invalid credentials" };
    }

    const data = await response.json();

    await createSession({
      userID: "real-user-id",
      name: "Real User",
      avatar: "/assets/default-avatar.png",
      role: "viewer",
      email: email,
      scopes: data.scopes,
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    });

  } catch (error) {
    console.error("An error occurred during login:", error);
    return { error: "An unexpected error occurred." };
  }

  redirect("/platform");
}