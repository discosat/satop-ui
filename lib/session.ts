// lib/session.ts
"use server";

import { auth0 } from "./auth0";
import { GetUserMe } from "@/app/api/users/users-service";
import type { SessionPayload } from "./types";

/**
 * Get the current session with user data from backend
 * This combines Auth0 authentication with backend authorization
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    // Get Auth0 session
    const auth0Session = await auth0.getSession();
    
    if (!auth0Session) {
      return null;
    }

    // Get user data from backend (includes role)
    const user = await GetUserMe();
    
    if (!user) {
      // User authenticated with Auth0 but not found in backend
      console.warn("User authenticated with Auth0 but not found in backend");
      return null;
    }

    return {
      user,
      isAuthenticated: true,
      accessToken: auth0Session.tokenSet.accessToken,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Get access token for API calls
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const auth0Session = await auth0.getSession();
    return auth0Session?.tokenSet.accessToken || null;
  } catch (error) {
    console.error("Error getting access token:", error);
    return null;
  }
}
