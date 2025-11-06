// lib/authorization.ts
import type { UserRole } from "@/app/api/users/types";

/**
 * Role hierarchy: ADMIN > OPERATOR > VIEWER
 */
const roleHierarchy: Record<UserRole, number> = {
  VIEWER: 1,
  OPERATOR: 2,
  ADMIN: 3,
};

/**
 * Check if a user's role meets the minimum required role
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if a user can access platform pages (VIEWER or higher)
 */
export function canAccessPlatform(userRole: UserRole): boolean {
  return hasRole(userRole, "VIEWER");
}

/**
 * Check if a user can access administration pages (ADMIN only)
 */
export function canAccessAdministration(userRole: UserRole): boolean {
  return hasRole(userRole, "ADMIN");
}

/**
 * Check if a user can perform operator actions (OPERATOR or higher)
 */
export function canPerformOperatorActions(userRole: UserRole): boolean {
  return hasRole(userRole, "OPERATOR");
}

/**
 * Get allowed routes based on user role
 */
export function getAllowedRoutes(userRole: UserRole): string[] {
  const routes: string[] = [];
  
  // All authenticated users can access these
  routes.push("/platform");
  
  // Admins can access administration
  if (canAccessAdministration(userRole)) {
    routes.push("/administration");
  }
  
  return routes;
}

/**
 * Check if a user can access a specific path based on their role
 */
export function canAccessPath(userRole: UserRole, path: string): boolean {
  // Public routes
  if (path === "/" || path === "/login" || path.startsWith("/auth/")) {
    return true;
  }
  
  // Platform routes - VIEWER and above
  if (path.startsWith("/platform")) {
    return canAccessPlatform(userRole);
  }
  
  // Administration routes - ADMIN only
  if (path.startsWith("/administration")) {
    return canAccessAdministration(userRole);
  }
  
  // Default deny
  return false;
}
