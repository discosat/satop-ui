"use server"

import { mockFlightPlans } from "./mock";
import { apiClient } from "@/app/api/api-client";
import type { FlightPlan, ApprovalResult } from "./types";

const API_PATH = '/flight-plans';



export type CreateFlightPlanPayload = Omit<FlightPlan, 'id' | 'status' | 'approverId' | 'approvalDate'>;

export async function getFlightPlans(): Promise<FlightPlan[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockFlightPlans;
  }
  try {
    return await apiClient.get<FlightPlan[]>(API_PATH);
  } catch (error) {
    console.error("Error fetching flight plans:", error);
    return [];
  }
}

export async function getFlightPlanById(id: number): Promise<FlightPlan | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockFlightPlans.find((p) => p.id === id) || null;
  }
  try {
    return await apiClient.get<FlightPlan>(`${API_PATH}/${id}`);
  } catch (error) {
    console.error(`Error fetching flight plan ${id}:`, error);
    return null;
  }
}

export async function createFlightPlan(payload: CreateFlightPlanPayload): Promise<FlightPlan> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const created: FlightPlan = {
      ...payload,
      id: Math.floor(Math.random() * 10000),
      status: "DRAFT",
    };
    mockFlightPlans.unshift(created);
    return created;
  }

  try {
    return await apiClient.post<CreateFlightPlanPayload, FlightPlan>(API_PATH, payload);
  } catch (error) {
    console.error('Error creating flight plan:', error);
    throw error;
  }
}

export async function updateFlightPlan(payload: FlightPlan): Promise<FlightPlan | null> {
  const id = payload.id;
  
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockFlightPlans.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockFlightPlans[index].status = 'SUPERSEDED';
      const newVersion: FlightPlan = { ...mockFlightPlans[index], id: Math.floor(Math.random() * 10000), status: 'DRAFT', previousPlanId: mockFlightPlans[index].id };
      mockFlightPlans.unshift(newVersion);
      return newVersion;
    }
    return null;
  }

  try {
    // Extract only the fields needed for the update payload, excluding read-only fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, status: _status, approverId: _approverId, approvalDate: _approvalDate, ...updatePayload } = payload;
    return await apiClient.put<Partial<FlightPlan>, FlightPlan>(`${API_PATH}/${id}`, updatePayload);
  } catch (error) {
    console.error('Error updating flight plan:', error);
    throw error;
  }
}

export async function approveFlightPlan(id: number, approved: boolean): Promise<ApprovalResult> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockFlightPlans.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockFlightPlans[index].status = approved ? 'APPROVED' : 'REJECTED';
      return { success: true, message: `Mock plan ${approved ? 'approved' : 'rejected'}` };
    }
    return { success: false, message: 'Mock plan not found' };
  }

  try {
    const body = {
      status: approved ? 'APPROVED' : 'REJECTED',
    };

    return await apiClient.patch<{ status: string }, ApprovalResult>(`${API_PATH}/${id}`, body);
  } catch (error) {
    console.error('Error approving flight plan:', error);
    throw error;
  }
}

export interface AssociateOverpassRequest {
  startTime: string;
  endTime: string;
}

export async function associateOverpass(
  flightPlanId: number,
  request: AssociateOverpassRequest
): Promise<ApprovalResult> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    try {
      // Wire into the overpass mock so the calendar reflects the change
      // We do a dynamic import to avoid circular import issues
      const overpassModule: typeof import("@/app/api/platform/overpass/mock") = await import("@/app/api/platform/overpass/mock");
      // Find the plan to copy metadata
      const plan = mockFlightPlans.find((p) => p.id === flightPlanId);
      if (!plan) {
        return { success: false, message: "Mock plan not found" };
      }
      const association = {
        id: plan.id,
        name: plan.name || `Plan ${plan.id}`,
        scheduledAt: request.startTime,
        status: "ASSIGNED_TO_OVERPASS",
      } as const;
      // We don't know sat/gs context here; record by time range only so the mock generator can match broadly
      if (typeof overpassModule.addMockOverpassAssociation === "function") {
        overpassModule.addMockOverpassAssociation({
          startTime: request.startTime,
          endTime: request.endTime,
          associatedFlightPlan: association,
        });
      }
      return { success: true, message: "Mock association created" };
    } catch {
      return { success: false, message: "Failed to create mock association" };
    }
  }

  try {
    return await apiClient.post<AssociateOverpassRequest, ApprovalResult>(`${API_PATH}/${flightPlanId}/associate-overpass`, request);
  } catch (error) {
    console.error('Error associating overpass:', error);
    throw error;
  }
}