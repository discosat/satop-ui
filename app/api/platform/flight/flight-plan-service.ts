import { FlightPlan } from "@/app/platform/flight/flight-table";
import { mockFlightPlans } from "./mock";
import { randomUUID } from "crypto";

const API_URL = 'http://localhost:5111/api/v1/flight-plans';

export interface ApprovalResult {
  success: boolean;
  message: string;
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

export async function getFlightPlanById(id: string): Promise<FlightPlan | null> {
  try {
    if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
      return mockFlightPlans.find((p) => p.id === id) || null;
    }
    const response = await fetch(`${API_URL}${id}`, {
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
      id: flightPlan.id || randomUUID(),
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
      mockFlightPlans[index].status = 'superseded';
      const newVersion: FlightPlan = { ...flightPlan, id: randomUUID(), status: 'pending', previous_plan_id: flightPlan.id };
      mockFlightPlans.unshift(newVersion);
      return newVersion;
    }
    return null;
  }

  try {
    const response = await fetch(`${API_URL}${flightPlan.id}`, {
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
    const index = mockFlightPlans.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockFlightPlans[index].status = approved ? 'approved' : 'rejected';
      return { success: true, message: `Mock plan ${approved ? 'approved' : 'rejected'}` };
    }
    return { success: false, message: 'Mock plan not found' };
  }

  try {
    const body = {
      status: approved ? 'approved' : 'rejected',
    };

    const response = await fetch(`${API_URL}${id}`, {
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