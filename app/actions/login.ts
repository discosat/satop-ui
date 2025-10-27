"use server";

import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { decodeJwt } from "jose";
import { SatOpsJwtPayload } from "@/lib/types";

export async function login(email: string, password: string) {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    await createSession({
      userID: "mock-admin-id-123",
      name: "Mock Admin",
      role: "admin",
      email: email,
      scopes: ["*"],
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
    });
    redirect("/platform");
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'http://localhost:5111/api/v1';
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Invalid credentials" }));
      return { error: errorData.message || "Invalid credentials" };
    }

    const { accessToken } = await response.json();

    const payload = decodeJwt<SatOpsJwtPayload>(accessToken);

    await createSession({
      userID: payload.sub,
      name: payload.name,
      avatar: "/assets/default-avatar.png",
      role: ((Array.isArray(payload.role) ? payload.role[0] : payload.role)?.toLowerCase() as "admin" | "scientist" | "viewer") || "viewer",
      email: payload.email,
      scopes: Array.isArray(payload.scope) ? payload.scope : (payload.scope ? [payload.scope] : []),
      accessToken: accessToken,
      refreshToken: "",
    });

  } catch (error) {
    console.error("An error occurred during login:", error);
    return { error: "An unexpected error occurred. Is the backend running?" };
  }

  redirect("/platform");
}