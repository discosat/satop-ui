// lib/auth-helpers.ts
"use server";

import { getSession } from "./session";
import { canAccessAdministration, canAccessPlatform, canPerformOperatorActions } from "./authorization";
import { redirect } from "next/navigation";
import type { UserRole } from "@/app/api/users/types";

/**
 * Server action to require authentication
 * Throws error if user is not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return session;
}

/**
 * Server action to require specific role
 */
export async function requireRole(role: UserRole, redirectPath = "/unauthorized") {
  const session = await requireAuth();
  
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    OPERATOR: 2,
    ADMIN: 3,
  };
  
  if (roleHierarchy[session.user.role] < roleHierarchy[role]) {
    redirect(redirectPath);
  }
  
  return session;
}

/**
 * Server action to require admin role
 */
export async function requireAdmin(redirectPath = "/unauthorized") {
  const session = await requireAuth();
  
  if (!canAccessAdministration(session.user.role)) {
    redirect(redirectPath);
  }
  
  return session;
}

/**
 * Server action to require operator role or higher
 */
export async function requireOperator(redirectPath = "/unauthorized") {
  const session = await requireAuth();
  
  if (!canPerformOperatorActions(session.user.role)) {
    redirect(redirectPath);
  }
  
  return session;
}

/**
 * Server action to require platform access (VIEWER or higher)
 */
export async function requirePlatformAccess(redirectPath = "/unauthorized") {
  const session = await requireAuth();
  
  if (!canAccessPlatform(session.user.role)) {
    redirect(redirectPath);
  }
  
  return session;
}

/**
 * Check if current user has specific role (without redirect)
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getSession();
  
  if (!session) {
    return false;
  }
  
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    OPERATOR: 2,
    ADMIN: 3,
  };
  
  return roleHierarchy[session.user.role] >= roleHierarchy[role];
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return session ? canAccessAdministration(session.user.role) : false;
}

/**
 * Check if current user is operator or higher
 */
export async function isOperator(): Promise<boolean> {
  const session = await getSession();
  return session ? canPerformOperatorActions(session.user.role) : false;
}
