"use client";

import { SessionContextProvider } from "../app/context";
import { SessionPayload } from "@/lib/types";

export default function SessionProvider({
  children,
  payload,
}: React.PropsWithChildren<{ payload: SessionPayload | null }>) {
  return (
    <SessionContextProvider value={payload}>{children}</SessionContextProvider>
  );
}
