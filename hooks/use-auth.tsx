"use client";

import { useSession } from "@/app/context";
import { SessionPayload } from "@/lib/types";

/**
 * Hook to get the current user info
 */
export function useUser(): SessionPayload["user"] | null {
  const session = useSession();
  return session?.user || null;
}
