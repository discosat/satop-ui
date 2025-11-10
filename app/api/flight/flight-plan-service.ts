"use server"

import { revalidateTag } from 'next/cache';
import { mockFlightPlans, generateMockCshScript, mockFlightPlanImages } from "./mock";
import { apiClient } from "@/app/api/api-client";
import type { FlightPlan, ApprovalResult, CompileToCshResult, ImagingOpportunity, FlightPlanImage } from "./types";

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
    revalidateTag('flight-plans');
    return created;
  }

  try {
    const result = await apiClient.post<CreateFlightPlanPayload, FlightPlan>(API_PATH, payload);
    revalidateTag('flight-plans');
    return result;
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
      revalidateTag('flight-plans');
      revalidateTag(`flight-plans:${id}`);
      return newVersion;
    }
    return null;
  }

  try {
    // Extract only the fields needed for the update payload, excluding read-only fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, status: _status, approvalDate: _approvalDate, ...updatePayload } = payload;
    const result = await apiClient.put<Partial<FlightPlan>, FlightPlan>(`${API_PATH}/${id}`, updatePayload);
    revalidateTag('flight-plans');
    revalidateTag(`flight-plans:${id}`);
    return result;
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
      revalidateTag('flight-plans');
      revalidateTag(`flight-plans:${id}`);
      return { success: true, message: `Mock plan ${approved ? 'approved' : 'rejected'}` };
    }
    return { success: false, message: 'Mock plan not found' };
  }

  try {
    const body = {
      status: approved ? 'APPROVED' : 'REJECTED',
    };

    const result = await apiClient.patch<{ status: string }, ApprovalResult>(`${API_PATH}/${id}`, body);
    revalidateTag('flight-plans');
    revalidateTag(`flight-plans:${id}`);
    return result;
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
      const overpassModule: typeof import("@/app/api/overpass/mock") = await import("@/app/api/overpass/mock");
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
      revalidateTag('flight-plans');
      revalidateTag(`flight-plans:${flightPlanId}`);
      revalidateTag('overpasses');
      return { success: true, message: "Mock association created" };
    } catch {
      return { success: false, message: "Failed to create mock association" };
    }
  }

  try {
    const result = await apiClient.post<AssociateOverpassRequest, ApprovalResult>(`${API_PATH}/${flightPlanId}/overpasses`, request);
    revalidateTag('flight-plans');
    revalidateTag(`flight-plans:${flightPlanId}`);
    revalidateTag('overpasses');
    return result;
  } catch (error) {
    console.error('Error associating overpass:', error);
    throw error;
  }
}

export async function compileFlightPlanToCsh(id: number): Promise<CompileToCshResult | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const plan = mockFlightPlans.find((p) => p.id === id);
    if (!plan) {
      return null;
    }
    return generateMockCshScript(id);
  }

  try {
    const result = await apiClient.get<CompileToCshResult | string[]>(`${API_PATH}/${id}/csh`);
    console.log(`CSH compilation response for flight plan ${id}:`, JSON.stringify(result, null, 2));
    
    // Handle different response formats
    // Case 1: Response is already in the expected format { script: string[] }
    if (result && typeof result === 'object' && 'script' in result && Array.isArray(result.script)) {
      return result as CompileToCshResult;
    }
    
    // Case 2: Response is a plain array of strings (backend returns array directly)
    if (Array.isArray(result)) {
      console.log('Backend returned script as array directly, wrapping in expected format');
      return { script: result };
    }
    
    // Case 3: Unexpected format
    console.error('Unexpected CSH response format:', result);
    return null;
  } catch (error) {
    console.error(`Error compiling flight plan ${id} to CSH:`, error);
    return null;
  }
}

export interface ImagingOpportunitiesRequest {
  satelliteId: number;
  targetLatitude: number;
  targetLongitude: number;
}

export async function getImagingOpportunities(
  request: ImagingOpportunitiesRequest
): Promise<ImagingOpportunity | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return {
      imagingTime: new Date().toISOString(),
      offNadirDegrees: 0,
      satelliteAltitudeKm: 400,
      tleAgeWarning: false,
      tleAgeHours: 24,
      message: "Mock imaging opportunity"
    };
  }

  try {
    const queryParams = new URLSearchParams({
      SatelliteId: request.satelliteId.toString(),
      TargetLatitude: request.targetLatitude.toString(),
      TargetLongitude: request.targetLongitude.toString(),
    });
    return await apiClient.get<ImagingOpportunity>(
      `${API_PATH}/imaging-opportunities?${queryParams.toString()}`
    );
  } catch (error) {
    console.error('Error fetching imaging opportunities:', error);
    return null;
  }
}

export async function getFlightPlanImages(flightPlanId: number): Promise<FlightPlanImage[]> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    return mockFlightPlanImages[flightPlanId] || [];
  }

  try {
    return await apiClient.get<FlightPlanImage[]>(`${API_PATH}/${flightPlanId}/images`);
  } catch (error) {
    console.error(`Error fetching images for flight plan ${flightPlanId}:`, error);
    return [];
  }
}