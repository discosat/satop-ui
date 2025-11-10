import { getFlightPlans } from "@/app/api/flight/flight-plan-service";
import type { FlightPlan } from "@/app/api/flight/types";
import { getUsers } from "@/app/api/users/users-service";
import type { User } from "@/app/api/users/types";

const FEED_LIMIT = 5;

export interface FlightPlanActivityEntry {
  id: number;
  name: string;
  status: FlightPlan["status"];
  approvedBy?: string;
  updatedAt?: string;
  createdAt?: string;
  approverRole?: string;
}

function sortByUpdatedAt(a: FlightPlan, b: FlightPlan): number {
  const updatedA = a.updatedAt ?? a.createdAt ?? "";
  const updatedB = b.updatedAt ?? b.createdAt ?? "";
  return new Date(updatedB).getTime() - new Date(updatedA).getTime();
}

function mapUserById(users: User[]): Map<number, User> {
  return new Map(users.map((user) => [user.id, user]));
}

export async function getFlightPlanActivityFeed(): Promise<FlightPlanActivityEntry[]> {
  try {
    const [plans, users] = await Promise.all([getFlightPlans(), getUsers()]);

    const userMap = mapUserById(users);

    return plans
      .slice()
      .sort(sortByUpdatedAt)
      .slice(0, FEED_LIMIT)
      .map((plan) => {
        const approver = plan.approvedById ? userMap.get(plan.approvedById) : undefined;

        return {
          id: plan.id,
          name: plan.name || `Plan #${plan.id}`,
          status: plan.status,
          approvedBy: approver?.name,
          approverRole: approver?.role,
          updatedAt: plan.updatedAt,
          createdAt: plan.createdAt,
        };
      });
  } catch (error) {
    console.error("Failed to load flight plan activity feed:", error);
    return [];
  }
}

