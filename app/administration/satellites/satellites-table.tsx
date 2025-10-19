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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SatelliteActions } from "./actions";
import {
  Satellite as SatelliteIcon,
  Hash,
  Clock,
  Calendar,
  Activity,
  Orbit,
  RefreshCw,
  ArrowUpDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Satellite, SatelliteStatus } from "@/app/api/platform/satellites/types";
import TablePagination from "@/components/ui/table-pagination";

interface SatellitesTableProps {
  satellites: Satellite[];
}

const getStatusColor = (status: SatelliteStatus) => {
  switch (status) {
    case SatelliteStatus.Active:
      return "bg-green-200 text-green-800 hover:bg-green-200";
    case SatelliteStatus.Inactive:
      return "bg-gray-200 text-gray-800 hover:bg-gray-200";
    case SatelliteStatus.UnderMaintenance:
      return "bg-yellow-200 text-yellow-800 hover:bg-yellow-200";
    case SatelliteStatus.Decommissioned:
      return "bg-red-200 text-red-800 hover:bg-red-200";
    case SatelliteStatus.Launching:
      return "bg-blue-200 text-blue-800 hover:bg-blue-200";
    default:
      return "bg-gray-200 text-gray-800 hover:bg-gray-200";
  }
};

const getStatusIcon = (status: SatelliteStatus) => {
  switch (status) {
    case SatelliteStatus.Active:
      return <Activity className="w-3 h-3" />;
    case SatelliteStatus.UnderMaintenance:
      return <RefreshCw className="w-3 h-3" />;
    case SatelliteStatus.Launching:
      return <Orbit className="w-3 h-3" />;
    default:
      return <Activity className="w-3 h-3" />;
  }
};

export default function SatellitesTable({ satellites }: SatellitesTableProps) {
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Satellite>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <SatelliteIcon className="w-4 h-4 text-blue-600" />
            <div>
              <div className="font-medium">{row.getValue("name")}</div>
              <div className="text-sm text-muted-foreground">
                ID: {row.original.id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "noradId",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            NORAD ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-sm">{row.getValue("noradId")}</span>
          </div>
        );
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
        const status = row.getValue("status") as SatelliteStatus;
        return (
          <Badge className={getStatusColor(status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(status)}
              {status}
            </div>
          </Badge>
        );
      },
    },
    {
      accessorKey: "lastUpdate",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Last TLE Update
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const lastUpdate = row.getValue("lastUpdate") as string;
        return lastUpdate ? (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm">{formatDate(lastUpdate)}</div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(lastUpdate)}
              </div>
            </div>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Never</span>
        );
      },
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = rowA.getValue(columnId) ? new Date(rowA.getValue(columnId)) : new Date(0);
        const dateB = rowB.getValue(columnId) ? new Date(rowB.getValue(columnId)) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="text-sm">{formatDate(createdAt)}</div>
              <div className="text-xs text-muted-foreground">
                {formatRelativeTime(createdAt)}
              </div>
            </div>
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
      id: "actions",
      header: "",
      cell: ({ row }) => {
        return <SatelliteActions satellite={row.original} />;
      },
      enableSorting: false,
      enableHiding: false,
    },
  ], []);

  // Update global filter when search query changes
  React.useEffect(() => {
    setGlobalFilter(query);
  }, [query]);

  const table = useReactTable({
    data: satellites,
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
      const satellite = row.original;
      const searchValue = value.toLowerCase();
      
      // Search across multiple fields
      const searchFields = [
        satellite.name,
        satellite.noradId,
        satellite.id.toString(),
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
                className="hover:bg-muted/50"
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
                No satellites found
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
