// lib/types.ts
import type { User, UserRole } from "@/app/api/users/types";

export type { User, UserRole };

export interface SessionPayload {
  user: User;
  isAuthenticated: boolean;
  accessToken?: string;
}

export interface Auth0Session {
  user: {
    sub: string;
    name?: string;
    email?: string;
    picture?: string;
    [key: string]: unknown;
  };
  accessToken: string;
  idToken?: string;
}
