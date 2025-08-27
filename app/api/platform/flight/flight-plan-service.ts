import { FlightPlan } from "@/app/platform/flight/flight-table";
import { mockFlightPlans } from "./mock";
import { randomUUID } from "crypto";

const API_URL = 'http://0.0.0.0:7889/api/plugins/scheduling'
const token = 'steve;user,admin,test'

export async function getFlightPlans(): Promise<FlightPlan[]> {
  try {
    if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
      return mockFlightPlans;
    }
    const response = await fetch(`${API_URL}/get_all`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 } 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight plans: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(data);
    return data || [];
  } catch (error) {
    console.error("Error fetching flight plans:", error);
    return []; // Return empty array on error
  }
}

export async function getFlightPlanById(id: string): Promise<FlightPlan | null> {
  try {
    if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
      console.log("IM IN MOCKED MODE??")
      const plan = mockFlightPlans.find((p) => p.id === id);
      console.log(plan);
      return plan || null;
    }
    const response = await fetch(`${API_URL}/get/${id}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight plan: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data
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
    const response = await fetch(`${API_URL}/save`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightPlan),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to create flight plan (${response.status}): ${response.statusText} ${text}`.trim());
    }

    type CreateFlightPlanEnvelope = { flightPlan: FlightPlan };
    const dataUnknown = await response.json().catch(() => ({}));

    const isEnvelope = (val: unknown): val is CreateFlightPlanEnvelope => {
      return typeof val === 'object' && val !== null && 'flightPlan' in (val as Record<string, unknown>);
    };

    if (isEnvelope(dataUnknown)) {
      return dataUnknown.flightPlan;
    }
    return dataUnknown as FlightPlan;
  } catch (error) {
    console.error('Error creating flight plan:', error);
    throw error;
  }
}

export async function updateFlightPlan(flightPlan: FlightPlan): Promise<FlightPlan | null> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockFlightPlans.findIndex((p) => p.id === flightPlan.id);
    if (index !== -1) {
      mockFlightPlans[index] = flightPlan;
      return flightPlan;
    }
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/update/${flightPlan.id}`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flightPlan),
      cache: 'no-store',
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to update flight plan (${response.status}): ${response.statusText} ${text}`.trim());
    }

    const data = await response.json();
    return data 
  } catch (error) {
    console.error('Error updating flight plan:', error);
    return null;
  }
}

export async function approveFlightPlan(id: string, approved: boolean): Promise<boolean> {
  if (process.env.MOCKED || process.env.NEXT_PUBLIC_MOCKED) {
    const index = mockFlightPlans.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockFlightPlans[index].status = approved ? 'approved' : 'rejected';
      return true;
    }
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/approve/${id}?approved=${approved}`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Failed to approve flight plan (${response.status}): ${response.statusText} ${text}`.trim());
    }

    return true;
  } catch (error) {
    console.error('Error approving flight plan:', error);
    return false;
  }
}
