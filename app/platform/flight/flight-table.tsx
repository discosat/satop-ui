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
import { CalendarClock, Satellite, Radio, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";

// Define FlightPlan interface based on the Python code model
export interface FlightPlan {
  id: string;
  flight_plan: {
    name: string;
    body: Record<string, unknown>[];
  };
  datetime: string;
  gs_id: string;
  sat_name: string;
  status: "pending" | "approved" | "rejected";
}

interface FlightPlansTableProps {
  flightPlans: FlightPlan[];
}

export default function FlightPlansTable({
  flightPlans,
}: FlightPlansTableProps) {
  const router = useRouter();

  // Format datetime for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  // Get status badge based on flight plan status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-200 text-green-800 hover:bg-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-200 text-red-800 hover:bg-red-200">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-200 text-yellow-800 hover:bg-yellow-200">
            Pending Approval
          </Badge>
        );
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
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flightPlans.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-8 text-muted-foreground"
              >
                No flight plans found
              </TableCell>
            </TableRow>
          ) : (
            flightPlans.map((plan) => (
              <TableRow
                key={plan.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleFlightPlanClick(plan.id)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-muted-foreground" />
                    {plan.flight_plan.name || "Command Sequence"}
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
                    {formatDate(plan.datetime)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(plan.status)}</TableCell>
                <TableCell>
                  {/* <Actions  /> */}
                  Actions will be here:)
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
