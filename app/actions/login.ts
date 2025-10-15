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
    const response = await fetch("http://localhost:7890/api/auth/user/login", {
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
      role: ((Array.isArray(payload.role) ? payload.role[0] : payload.role)?.toLowerCase() as "admin" | "scientist" | "viewer" | "applicant") || "viewer",
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