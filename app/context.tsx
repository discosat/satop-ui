"use client";
import { SessionPayload } from "@/lib/types";
import React, { useContext } from "react";


const SessionContext = React.createContext<SessionPayload | null>(null);

export function SessionProvider({ 
  children, 
  session 
}: { 
  children: React.ReactNode; 
  session: SessionPayload | null;
}) {
  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
