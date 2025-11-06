import type { User } from "./types";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    role: "ADMIN",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@example.com",
    role: "OPERATOR",
    createdAt: "2025-02-20T14:30:00Z",
    updatedAt: "2025-03-10T09:15:00Z",
  },
  {
    id: 3,
    name: "Charlie Davis",
    email: "charlie.davis@example.com",
    role: "VIEWER",
    createdAt: "2025-03-05T08:45:00Z",
    updatedAt: "2025-03-05T08:45:00Z",
  },
  {
    id: 4,
    name: "Diana Martinez",
    email: "diana.martinez@example.com",
    role: "OPERATOR",
    createdAt: "2025-04-12T16:20:00Z",
    updatedAt: "2025-05-01T11:30:00Z",
  },
  {
    id: 5,
    name: "Eve Wilson",
    email: "eve.wilson@example.com",
    role: "VIEWER",
    createdAt: "2025-05-18T13:00:00Z",
    updatedAt: "2025-05-18T13:00:00Z",
  },
];
