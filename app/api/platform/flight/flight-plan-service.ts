import { FlightPlan } from "@/app/platform/flight/flight-table";
import {mockFlightPlans} from "./mock";

const API_URL = 'http://127.0.0.1:7889/api/plugins/scheduling'
const token = 'steve;user,admin,test'

export async function getFlightPlans(): Promise<FlightPlan[]> {
  try {



   /*  const response = await fetch(`${API_URL}/get_all`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${token}`,
      },
      // Add Next.js fetch options for caching
      next: { revalidate: 60 } // Revalidate cache every 60 seconds
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight plans: ${response.statusText}`);
    } */
    
    //const data = await response.json();
    //return data.flightPlans || [];
    return mockFlightPlans
  } catch (error) {
    console.error("Error fetching flight plans:", error);
    return []; // Return empty array on error
  }
}

export async function getFlightPlanById(id: string): Promise<FlightPlan | null> {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch flight plan: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.flightPlan;
  } catch (error) {
    console.error(`Error fetching flight plan ${id}:`, error);
    return null;
  }
}