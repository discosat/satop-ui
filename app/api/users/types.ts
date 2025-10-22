export type UserRole = "VIEWER" | "OPERATOR" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  additionalRoles: string[];
  additionalScopes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPayload {
  name: string;
  email: string;
}

export interface UpdateUserPermissionsPayload {
  role: UserRole;
  additionalRoles: string[];
  additionalScopes: string[];
}
