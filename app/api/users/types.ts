export type UserRole = "VIEWER" | "OPERATOR" | "ADMIN";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserPermissionsPayload {
  role: UserRole;
}
