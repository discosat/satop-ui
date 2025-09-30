"use client";

import { SessionPayload } from "@/lib/session";
import { SessionContextProvider } from "../app/context";

export default function SessionProvider({
  children,
  payload,
}: React.PropsWithChildren<{ payload: SessionPayload | null }>) {
  return (
    <SessionContextProvider value={payload}>{children}</SessionContextProvider>
  );
}
