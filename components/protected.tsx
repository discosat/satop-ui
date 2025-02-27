"use client";
import { useSession } from "@/app/context";
import { hasScope } from "@/lib/user";
import { PropsWithChildren } from "react";

interface ProtectedProps {
  scope: string;
}

export default function Protected({
  children,
  scope,
}: PropsWithChildren<ProtectedProps>) {
  const session = useSession();

  // Check authorization state
  if (!session) return;
  if (!hasScope(session, scope)) return;

  return children;
}
