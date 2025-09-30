"use client";

import React, { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  PaginationState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarClock, Satellite as SatelliteIcon, Radio, Clock, GitBranch, UserCheck, ArrowUpDown } from "lucide-react"; 
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter, useSearchParams } from "next/navigation";
import { FlightPlan, FlightPlanStatus } from "@/app/api/platform/flight/flight-plan-service";
import { Satellite } from "@/app/api/platform/satellites/satellite-service";
import { GroundStation } from "@/app/api/platform/ground-stations/mock";
import TablePagination from "@/components/ui/table-pagination";

// Extended flight plan type with lookup data
type FlightPlanWithLookup = FlightPlan & {
  satelliteName: string;
  groundStationName: string;
};

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
  const query = searchParams.get("query") || "";

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState(query);
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Create lookup maps for ID to name conversion
  const satelliteMap = useMemo(() => new Map(satellites.map(sat => [sat.id, sat.name])), [satellites]);
  const groundStationMap = useMemo(() => new Map(groundStations.map(gs => [gs.id, gs.name])), [groundStations]);

  // Prepare data with lookup fields
  const data = useMemo(() => {
    const activePlans = flightPlans.filter(plan => plan.status !== 'superseded');
    return activePlans.map(plan => ({
      ...plan,
      satelliteName: satelliteMap.get(plan.satId) || `Satellite ${plan.satId}`,
      groundStationName: groundStationMap.get(plan.gsId) || `Ground Station ${plan.gsId}`,
    }));
  }, [flightPlans, satelliteMap, groundStationMap]);

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

  // Column definitions
  const columns = useMemo<ColumnDef<FlightPlanWithLookup>[]>(() => [
    {
      accessorKey: "flightPlanBody.name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Flight Plan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const plan = row.original;
        return (
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
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue(id)?.toString().toLowerCase().includes(value.toLowerCase()) ?? false;
      },
    },
    {
      accessorKey: "satelliteName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Satellite
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <SatelliteIcon className="w-4 h-4 text-blue-500" />
            <span className="truncate max-w-[150px]">
              {row.getValue("satelliteName")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "groundStationName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Ground Station
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const plan = row.original;
        return (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-600" />
                <span className="truncate max-w-[150px]">
                  {row.getValue("groundStationName")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.getValue("groundStationName")} (ID: {plan.gsId})</p>
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "scheduledAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Scheduled Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {formatDate(row.getValue("scheduledAt"))}
          </div>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = new Date(rowA.getValue(columnId));
        const dateB = new Date(rowB.getValue(columnId));
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Status
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const plan = row.original;
        return (
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
        );
      },
    },
  ], []);

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = data;

    // Get filter values from URL
    const selectedSatellites = searchParams.get('satellites')?.split(',').filter(Boolean) || [];
    const selectedGroundStations = searchParams.get('groundStations')?.split(',').filter(Boolean) || [];
    const selectedStatuses = searchParams.get('statuses')?.split(',').filter(Boolean) || [];
    const selectedTimeRange = searchParams.get('timeRange') || '';

    // Apply satellite filter
    if (selectedSatellites.length > 0) {
      filtered = filtered.filter(plan => 
        selectedSatellites.includes(plan.satId.toString())
      );
    }

    // Apply ground station filter
    if (selectedGroundStations.length > 0) {
      filtered = filtered.filter(plan => 
        selectedGroundStations.includes(plan.gsId.toString())
      );
    }

    // Apply status filter
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(plan => 
        selectedStatuses.includes(plan.status)
      );
    }

    // Apply time range filter
    if (selectedTimeRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(plan => {
        if (!plan.scheduledAt) return false;
        const scheduledDate = new Date(plan.scheduledAt);
        
        switch (selectedTimeRange) {
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return scheduledDate >= today && scheduledDate < tomorrow;
            
          case 'tomorrow':
            const dayAfterTomorrow = new Date(today);
            dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
            const tomorrowStart = new Date(today);
            tomorrowStart.setDate(tomorrowStart.getDate() + 1);
            return scheduledDate >= tomorrowStart && scheduledDate < dayAfterTomorrow;
            
          case 'this-week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);
            return scheduledDate >= startOfWeek && scheduledDate < endOfWeek;
            
          case 'next-week':
            const nextWeekStart = new Date(today);
            nextWeekStart.setDate(today.getDate() - today.getDay() + 7);
            const nextWeekEnd = new Date(nextWeekStart);
            nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
            return scheduledDate >= nextWeekStart && scheduledDate < nextWeekEnd;
            
          case 'this-month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            return scheduledDate >= startOfMonth && scheduledDate < endOfMonth;
            
          case 'next-month':
            const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 1);
            return scheduledDate >= nextMonthStart && scheduledDate < nextMonthEnd;
            
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [data, searchParams]);

  // Update global filter when search query changes
  React.useEffect(() => {
    setGlobalFilter(query);
  }, [query]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, value) => {
      const plan = row.original;
      const searchValue = value.toLowerCase();
      
      // Search across multiple fields
      const searchFields = [
        plan.flightPlanBody.name,
        plan.satelliteName,
        plan.groundStationName,
        plan.satId.toString(),
        plan.gsId.toString(),
      ];
      
      return searchFields.some(field => 
        field?.toLowerCase().includes(searchValue)
      );
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination,
    },
  });

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleFlightPlanClick(row.original.id)}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="font-medium">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No flight plans found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      <TablePagination table={table} />
      
      
    </div>
  );
}