import { mockFlightPlans } from "./mock";

const API_URL = 'http://localhost:5111/api/v1/flight-plans';

export interface ApprovalResult {
  success: boolean;
  message: string;
}

export type FlightPlanStatus = "DRAFT" | "APPROVED" | "REJECTED" | "ASSIGNED_TO_OVERPASS"| "SUPERSEDED" | "TRANSMITTED";
export interface FlightPlan {
  id: number;
  previousPlanId?: string;
  gsId: number;
  satId: number;
  overpassId?: number;
  scheduledAt?: string;
  flightPlanBody: {
    name: string;
    body: string;
  };
  status: FlightPlanStatus;
  approverId?: string;
  approvalDate?: string;
}

export async function getFlightPlans(): Promise<FlightPlan[]> {
  try {
    if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
      return mockFlightPlans;
    }
    const response = await fetch(API_URL, {
      method: 'GET',
      next: { revalidate: 60 } 
    });

    if (response.status === 404) {
      console.log("No flight plans found on the server, returning empty list.");
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight plans: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching flight plans:", error);
    return []; // Return empty array on error
  }
}

export async function getFlightPlanById(id: number): Promise<FlightPlan | null> {
  try {
    if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
      return mockFlightPlans.find((p) => p.id === id) || null;
    }
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'GET',
      next: { revalidate: 60 }
    });
    
    if (!response.ok) throw new Error(`Failed to fetch flight plan: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching flight plan ${id}:`, error);
    return null;
  }
}

export async function createFlightPlan(flightPlan: FlightPlan): Promise<FlightPlan> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const created: FlightPlan = {
      ...flightPlan,
      id: flightPlan.id || Math.floor(Math.random() * 10000),
    };
    mockFlightPlans.unshift(created);
    return created;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightPlan),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to create flight plan (${response.status}): ${response.statusText} ${text}`.trim());
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating flight plan:', error);
    throw error;
  }
}

export async function updateFlightPlan(flightPlan: FlightPlan, accessToken: string): Promise<FlightPlan | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockFlightPlans.findIndex((p) => p.id === flightPlan.id);
    if (index !== -1) {
      mockFlightPlans[index].status = 'SUPERSEDED';
      const newVersion: FlightPlan = { ...flightPlan, id: Math.floor(Math.random() * 10000), status: 'DRAFT', previousPlanId: flightPlan.id.toString() };
      mockFlightPlans.unshift(newVersion);
      return newVersion;
    }
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/${flightPlan.id}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightPlan),
      cache: 'no-store',
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to update flight plan (${response.status}): ${response.statusText} ${text}`.trim());
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating flight plan:', error);
    throw error;
  }
}

export async function approveFlightPlan(id: string, approved: boolean, accessToken: string): Promise<ApprovalResult> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockFlightPlans.findIndex((p) => p.id === Number(id));
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

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseData = await response.json();
    if (!response.ok) {
      const errorMessage = responseData.detail || responseData.message || 'Unknown error occurred';
      throw new Error(`Failed to approve flight plan (${response.status}): ${errorMessage}`);
    }
    return {
      success: true,
      message: responseData.message || 'Operation successful.',
    };
  } catch (error) {
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
      const overpassModule: typeof import("@/app/api/platform/overpass/overpass-service") = await import("@/app/api/platform/overpass/overpass-service");
      // Find the plan to copy metadata
      const plan = mockFlightPlans.find((p) => p.id === flightPlanId);
      if (!plan) {
        return { success: false, message: "Mock plan not found" };
      }
      const association = {
        id: plan.id,
        name: plan.flightPlanBody?.name || `Plan ${plan.id}`,
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
    const response = await fetch(`${API_URL}/${flightPlanId}/associate-overpass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to associate overpass (${response.status}): ${response.statusText} ${text}`.trim());
    }

    return { success: true, message: 'Association created' };
  } catch (error) {
    console.error('Error associating overpass:', error);
    throw error;
  }
}