"use client";
import { useSession } from "@/app/context";
import { PropsWithChildren, ReactNode } from "react";

interface ProtectedProps {
  fallback?: ReactNode;
}

export default function Protected({
  children,
  fallback = null,
}: PropsWithChildren<ProtectedProps>) {
  const session = useSession();

  if (!session) return <>{fallback}</>;

  return <>{children}</>;
}
