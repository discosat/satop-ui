"use server"

import { mockUsers } from "./mock";
import { apiClient } from "@/app/api/api-client";
import type { User, UpdateUserPayload, UpdateUserPermissionsPayload } from "./types";

const API_PATH = '/users';

export async function getUsers(): Promise<User[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockUsers;
  }
  try {
    return await apiClient.get<User[]>(API_PATH);
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUserById(id: number): Promise<User | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockUsers.find((u) => u.id === id) || null;
  }
  try {
    return await apiClient.get<User>(`${API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers[index] = {
        ...mockUsers[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return mockUsers[index];
    }
    return null;
  }

  try {
    return await apiClient.put<UpdateUserPayload, User>(`${API_PATH}/${id}`, payload);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
}

export async function deleteUser(id: number): Promise<void> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
    return;
  }

  try {
    await apiClient.delete(`${API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
}

export async function updateUserPermissions(
  id: number,
  payload: UpdateUserPermissionsPayload
): Promise<User | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers[index] = {
        ...mockUsers[index],
        ...payload,
        updatedAt: new Date().toISOString(),
      };
      return mockUsers[index];
    }
    return null;
  }

  try {
    return await apiClient.put<UpdateUserPermissionsPayload, User>(
      `${API_PATH}/${id}/permissions`,
      payload
    );
  } catch (error) {
    console.error(`Error updating permissions for user ${id}:`, error);
    throw error;
  }
}
