"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Bot } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Actions from "./actions";
import { User } from "./page";
import { RoleBadge } from "./role-badge";
import { ScopeBadge } from "./scope-badge";

interface UsersTableProps {
  filteredUsers: User[];
}

export default function UsersTable({ filteredUsers }: UsersTableProps) {
  return (
    <div className="rounded-md ">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-muted-foreground"
              >
                No users found
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
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
                    {user.name}
                    {user.type === "machine" && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge className="px-0.5 bg-gray-800 text-gray-600 hover:bg-gray-800">
                            <Bot className="w-4 h-4" />
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Machine</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <RoleBadge role={user.role} />
                    <ScopeBadge scopes={user?.scopes} />
                  </div>
                </TableCell>
                <TableCell>
                  {/*Todo add User to actions*/}
                  {user && <Actions user={user} />}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
