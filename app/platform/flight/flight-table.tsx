"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CalendarClock, Satellite as SatelliteIcon, Radio, Clock, GitBranch, UserCheck } from "lucide-react"; 
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import { FlightPlan, FlightPlanStatus } from "@/app/api/platform/flight/flight-plan-service";
import { Satellite } from "@/app/api/platform/satellites/satellite-service";
import { GroundStation } from "@/app/api/platform/ground-stations/mock";

interface FlightPlansTableProps {
  flightPlans: FlightPlan[];
  satellites: Satellite[];
  groundStations: GroundStation[];
}

export default function FlightPlansTable({
  flightPlans,
  satellites,
  groundStations,
}: FlightPlansTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  // Create lookup maps for ID to name conversion
  const satelliteMap = new Map(satellites.map(sat => [sat.id, sat.name]));
  const groundStationMap = new Map(groundStations.map(gs => [gs.id, gs.name]));

  const activePlans = flightPlans.filter(plan => plan.status !== 'superseded');

  const filteredPlans = query
    ? activePlans.filter(
        (plan) => {
          const queryLower = query!.toLowerCase();
          const satelliteName = satelliteMap.get(plan.satId) || '';
          const groundStationName = groundStationMap.get(plan.gsId) || '';
          
          return plan.flightPlanBody.name.toLowerCase().includes(queryLower) ||
                 plan.satId.toString().toLowerCase().includes(queryLower) ||
                 plan.gsId.toString().toLowerCase().includes(queryLower) ||
                 satelliteName.toLowerCase().includes(queryLower) ||
                 groundStationName.toLowerCase().includes(queryLower);
        }
      )
    : activePlans;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  // Get status badge based on flight plan status
  const getStatusBadge = (status: FlightPlanStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-200 text-green-800 hover:bg-green-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-200 text-red-800 hover:bg-red-200">Rejected</Badge>;
      case "superseded":
        return <Badge variant="secondary">Superseded</Badge>;
      case "transmitted":
        return <Badge className="bg-blue-200 text-blue-800 hover:bg-blue-200">Transmitted</Badge>;
      default: // pending
        return <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200">Pending Approval</Badge>;
    }
  };

  // Handle click on a flight plan row
  const handleFlightPlanClick = (id: number) => {
    router.push(`/platform/flight/${id}`);
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Flight Plan</TableHead>
            <TableHead>Satellite</TableHead>
            <TableHead>Ground Station</TableHead>
            <TableHead>Scheduled Time</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPlans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                No flight plans found
              </TableCell>
            </TableRow>
          ) : (
            filteredPlans.map((plan) => (
              <TableRow
                key={plan.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleFlightPlanClick(plan.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-muted-foreground" />
                    {plan.flightPlanBody.name || "Command Sequence"}
                    {plan.previousPlanId && (
                       <Tooltip>
                         <TooltipTrigger>
                           <GitBranch className="w-3 h-3 text-muted-foreground" />
                         </TooltipTrigger>
                         <TooltipContent>
                           <p>This is a new version of another plan.</p>
                         </TooltipContent>
                       </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SatelliteIcon className="w-4 h-4 text-blue-500" />
                    <span className="truncate max-w-[150px]">
                      {satelliteMap.get(plan.satId) || `Satellite ${plan.satId}`}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-green-600" />
                        <span className="truncate max-w-[150px]">
                          {groundStationMap.get(plan.gsId) || `Ground Station ${plan.gsId}`}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{groundStationMap.get(plan.gsId) || `Ground Station ${plan.gsId}`} (ID: {plan.gsId})</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatDate(plan.scheduledAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(plan.status as FlightPlanStatus)}
                    {plan.approverId && (plan.status === 'approved' || plan.status === 'rejected') && (
                      <Tooltip>
                        <TooltipTrigger>
                          <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {plan.status === 'approved' ? 'Approved' : 'Rejected'} by {plan.approverId}
                          </p>
                          {plan.approvalDate && <p>on {formatDate(plan.approvalDate)}</p>}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}