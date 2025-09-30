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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, User as UserIcon, Mail } from "lucide-react";
import Actions from "./actions";
import { User } from "./page";
import { RoleBadge } from "./role-badge";
import { ScopeBadge } from "./scope-badge";
import TablePagination from "@/components/ui/table-pagination";
import { useSearchParams } from "next/navigation";

interface UsersTableProps {
  users: User[];
}

export default function UsersTable({ users }: UsersTableProps) {
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

  // Column definitions
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={`/api/placeholder/32/32`}
                alt={user.name}
              />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-600" />
              {user.name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            {row.getValue("email")}
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 p-0 hover:bg-transparent"
          >
            Role
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2">
            <RoleBadge role={user.role} />
            <ScopeBadge scopes={user?.scopes} />
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        return user && <Actions user={user} />;
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
    data: users,
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
      const user = row.original;
      const searchValue = value.toLowerCase();
      
      // Search across multiple fields
      const searchFields = [
        user.name,
        user.email,
        user.role,
        user.id,
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
                No users found
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
