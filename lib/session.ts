import "server-only";
import { EncryptJWT, JWTPayload, jwtDecrypt, base64url } from "jose";
import { cookies } from "next/headers";

export interface SessionPayload extends JWTPayload {
  userID: string;
  name: string;
  avatar: string;
  role: "admin" | "scientist" | "viewer" | "applicant";
  email: string;
  scopes: string[];
  accessToken: string;
  refreshToken: string;
}

const SESSION_KEY = "SESSION";
const SECRET_KEY = process.env.SESSION_COOKIE_SECRET;
const EXPIRES_IN = 7 * 24 * 60 * 60 * 1000;

const encodedKey = base64url.decode(SECRET_KEY!);

export async function encrypt(payload: SessionPayload) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A128CBC-HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtDecrypt<SessionPayload>(session, encodedKey);
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
