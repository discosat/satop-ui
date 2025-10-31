"use server";

import { auth0 } from "@/lib/auth0";
import { toSessionPayload, SessionPayload } from "@/lib/types";

export async function me(): Promise<SessionPayload | null> {
  const session = await auth0.getSession();
  return toSessionPayload(session);
}
