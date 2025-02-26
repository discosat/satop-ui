import "server-only";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import React from "react";

export interface SessionPayload extends JWTPayload {
  userID: string;
  name: string;
  avatar: string;
  role: "admin" | "scientist" | "viewer";
  email: string;
  scopes: Set<string>;
  accessToken: string;
  refreshToken: string;
}

const SESSION_KEY = "SESSION";
const SECRET_KEY = process.env.SESSION_COOKIE_SECRET;
const EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

const encodedKey = new TextEncoder().encode(SECRET_KEY);

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify<SessionPayload>(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error: unknown) {
    console.log("Failed to verify session", error);
  }
}

export async function createSession(payload: SessionPayload) {
  const expiresAt = new Date(Date.now() + EXPIRES_IN);
  const session = await encrypt(payload);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_KEY, session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function currentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_KEY);
  if (!sessionCookie) return null;

  const payload = await decrypt(sessionCookie.value);
  if (!payload) return null;
  return payload;
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}
