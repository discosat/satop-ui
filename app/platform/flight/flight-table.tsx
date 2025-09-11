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
import { CalendarClock, Satellite, Radio, Clock, GitBranch, UserCheck } from "lucide-react"; // Added UserCheck icon
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";

export type FlightPlanStatus = "pending" | "approved" | "rejected" | "superseded" | "transmitted";

export interface FlightPlan {
  id: string;
  flight_plan: {
    name: string;
    body: Record<string, unknown>[];
  };
  scheduled_at: string;
  gs_id: string;
  sat_name: string;
  status: FlightPlanStatus;
  previous_plan_id?: string;
  approver_id?: string;
  approval_date?: string;
}

interface FlightPlansTableProps {
  flightPlans: FlightPlan[];
}

export default function FlightPlansTable({
  flightPlans,
}: FlightPlansTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  const activePlans = flightPlans.filter(plan => plan.status !== 'superseded');

  const filteredPlans = query
    ? activePlans.filter(
        (plan) =>
          plan.flight_plan.name.toLowerCase().includes(query!.toLowerCase()) ||
          plan.sat_name.toLowerCase().includes(query!.toLowerCase()) ||
          plan.gs_id.toLowerCase().includes(query!.toLowerCase())
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
  const handleFlightPlanClick = (id: string) => {
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
                    {plan.flight_plan.name || "Command Sequence"}
                    {plan.previous_plan_id && (
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
                    <Satellite className="w-4 h-4 text-blue-500" />
                    {plan.sat_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-green-600" />
                        <span className="truncate max-w-[150px]">
                          {plan.gs_id.substring(0, 8)}...
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Ground Station ID: {plan.gs_id}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatDate(plan.scheduled_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(plan.status)}
                    {plan.approver_id && (plan.status === 'approved' || plan.status === 'rejected') && (
                      <Tooltip>
                        <TooltipTrigger>
                          <UserCheck className="w-3.5 h-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            {plan.status === 'approved' ? 'Approved' : 'Rejected'} by {plan.approver_id}
                          </p>
                          {plan.approval_date && <p>on {formatDate(plan.approval_date)}</p>}
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