"use client";

import { useSession } from "@/app/context";
import { canAccessAdministration, canAccessPlatform, canPerformOperatorActions } from "@/lib/authorization";
import type { UserRole } from "@/app/api/users/types";
import { useRouter } from "next/navigation";
import { useEffect, PropsWithChildren, ReactNode } from "react";

interface ProtectedProps {
  fallback?: ReactNode;
  requiredRole?: UserRole;
  requireAdmin?: boolean;
  requireOperator?: boolean;
  redirectTo?: string;
}

/**
 * Client-side component for protecting content based on user role
 * For better UX, use this in addition to server-side checks
 */
export default function Protected({
  children,
  fallback = null,
  requiredRole,
  requireAdmin = false,
  requireOperator = false,
  redirectTo,
}: PropsWithChildren<ProtectedProps>) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && redirectTo) {
      router.push(redirectTo);
    }
  }, [session, redirectTo, router]);

  if (!session) {
    return <>{fallback}</>;
  }

  const userRole = session.user.role;

  // Check specific role requirement
  if (requiredRole) {
    const roleHierarchy: Record<UserRole, number> = {
      VIEWER: 1,
      OPERATOR: 2,
      ADMIN: 3,
    };
    
    const userRoleLevel = roleHierarchy[userRole as UserRole];
    const requiredRoleLevel = roleHierarchy[requiredRole as UserRole];
    
    if (userRoleLevel < requiredRoleLevel) {
      if (redirectTo) {
        router.push(redirectTo);
        return null;
      }
      return <>{fallback}</>;
    }
  }

  // Check admin requirement
  if (requireAdmin && !canAccessAdministration(userRole)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return <>{fallback}</>;
  }

  // Check operator requirement
  if (requireOperator && !canPerformOperatorActions(userRole)) {
    if (redirectTo) {
      router.push(redirectTo);
      return null;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has a specific role or higher
 */
export function useHasRole(requiredRole: UserRole): boolean {
  const session = useSession();
  
  if (!session) {
    return false;
  }

  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    OPERATOR: 2,
    ADMIN: 3,
  };

  const userRoleLevel = roleHierarchy[session.user.role as UserRole];
  const requiredRoleLevel = roleHierarchy[requiredRole as UserRole];

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  const session = useSession();
  return session ? canAccessAdministration(session.user.role) : false;
}

/**
 * Hook to check if user is operator or higher
 */
export function useIsOperator(): boolean {
  const session = useSession();
  return session ? canPerformOperatorActions(session.user.role) : false;
}

/**
 * Hook to check if user can access platform
 */
export function useCanAccessPlatform(): boolean {
  const session = useSession();
  return session ? canAccessPlatform(session.user.role) : false;
}
