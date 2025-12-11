
export interface ApprovalResult {
  success: boolean;
  message: string;
}

export interface CompileToCshResult {
  script: string[];
}

export interface ImagingOpportunity {
  possible: boolean;
  imagingTime: string;
  offNadirDegrees: number;
  satelliteAltitudeKm: number;
  tleAgeWarning: boolean;
  tleAgeHours: number;
  message: string;
}

export interface FlightPlanImage {
  imageId: number;
  flightPlanId: number;
  fileName: string;
  captureTime: string;
  url: string;
  expiresAt: string;
  contentType: string;
  fileSize: number;
  latitude: number;
  longitude: number;
}

export type FlightPlanStatus = "DRAFT" | "APPROVED" | "REJECTED" | "ASSIGNED_TO_OVERPASS"| "SUPERSEDED" | "TRANSMITTED" | "FAILED";
export interface FlightPlan {
  id: number;
  previousPlanId?: number;
  gsId?: number;
  satId: number;
  overpassId?: number;
  name: string;
  scheduledAt?: string;
  commands: object[];
  status: FlightPlanStatus;
  createdById?: number;
  approvedById?: number;
  approvalDate?: string;
  createdAt?: string;
  updatedAt?: string;
}