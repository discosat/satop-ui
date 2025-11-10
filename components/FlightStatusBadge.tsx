
import { Badge } from "@/components/ui/badge";
import type { FlightPlanStatus } from "@/app/api/flight/types";

interface FlightStatusBadgeProps {
  status: FlightPlanStatus;
}

export function FlightStatusBadge({ status }: FlightStatusBadgeProps) {
  switch (status) {
    case "APPROVED":
      return (
        <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-200 text-red-800 hover:bg-red-200">
          Rejected
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-red-200 text-red-800 hover:bg-red-200">
          Failed
        </Badge>
      );
    case "SUPERSEDED":
      return <Badge variant="secondary">Superseded</Badge>;
    case "TRANSMITTED":
      return (
        <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200">
          Transmitted
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
          Draft
        </Badge>
      );
    case "ASSIGNED_TO_OVERPASS":
      return (
        <Badge className="bg-purple-200 text-purple-800 hover:bg-purple-200">
          Assigned to Overpass
        </Badge>
      );
    default: // pending
      return (
        <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
          Pending Approval
        </Badge>
      );
  }
}