"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function login(email: string, password: string) {
  try {
    const response = await fetch("http://localhost:7889/api/plugins/login/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      console.error("Login failed:", await response.text());
      return { error: "Invalid credentials" };
    }

    const data = await response.json();
    console.log("--- RECEIVED FROM PYTHON BACKEND: ---", data);

    await createSession({
      // --- Temporary Mock Data ---
      userID: "mock-user-id",
      name: "Martin",
      avatar: "/assets/martin.jpeg",
      role: "viewer",
      // --------------------------

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