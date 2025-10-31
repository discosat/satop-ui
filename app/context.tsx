"use client";
import { SessionPayload } from "@/lib/types";
import React, { useContext } from "react";

const SessionContext = React.createContext<SessionPayload | null>(null);

export const SessionContextProvider = SessionContext.Provider;
export const useSession = () => useContext(SessionContext);
