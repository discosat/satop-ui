
export interface ApprovalResult {
  success: boolean;
  message: string;
}

export interface CompileToCshResult {
  script: string[];
}

export interface ImagingOpportunity {
  imagingTime: string;
  offNadirDegrees: number;
  satelliteAltitudeKm: number;
  tleAgeWarning: boolean;
  tleAgeHours: number;
  message: string;
}

export type FlightPlanStatus = "DRAFT" | "APPROVED" | "REJECTED" | "ASSIGNED_TO_OVERPASS"| "SUPERSEDED" | "TRANSMITTED" | "FAILED";
export interface FlightPlan {
  id: number;
  previousPlanId?: number;
  gsId: number;
  satId: number;
  overpassId?: number;
  name: string;
  scheduledAt?: string;
  commands: object[];
  status: FlightPlanStatus;
  approverId?: string;
  approvalDate?: string;
}