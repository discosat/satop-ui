"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreHorizontal, Plus, RefreshCw, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

// Types
type UserRole = "viewer" | "scientist" | "admin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  needsSupport?: boolean;
  supportReason?: string;
}

// Sample data
const users: User[] = [
  {
    id: "1",
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "admin",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "2",
    name: "Sam Wilson",
    email: "sam@example.com",
    role: "scientist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  },
  {
    id: "3",
    name: "Taylor Smith",
    email: "taylor@example.com",
    role: "viewer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
  },
  {
    id: "4",
    name: "Morgan Lee",
    email: "morgan@example.com",
    role: "scientist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
  },
  {
    id: "5",
    name: "Jamie Roberts",
    email: "jamie@example.com",
    role: "viewer",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamie",
    needsSupport: true,
    supportReason: "Account activation issues",
  },
  {
    id: "6",
    name: "Casey Brown",
    email: "casey@example.com",
    role: "scientist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
    needsSupport: true,
    supportReason: "Password reset request",
  },
];

// Role badge color mapping
const getRoleBadgeColor = (role: UserRole) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "scientist":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "viewer":
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    default:
      return "";
  }
};

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supportUsers = users.filter((user) => user.needsSupport);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="w-full">
        <Tabs defaultValue="all-users">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="support-users">
              Support Needed
              {supportUsers.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {supportUsers.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-users" className="mt-6">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="rounded-md border">
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
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={getRoleBadgeColor(user.role)}
                                variant="outline"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Edit user</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Change role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Reset password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    Delete user
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support-users" className="mt-6">
            <Card>
              <CardHeader className="pb-1">
                <CardTitle>Users Requiring Support</CardTitle>
                <CardDescription>
                  Users who have reported issues or need assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Support Reason</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supportUsers.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No users currently need support
                          </TableCell>
                        </TableRow>
                      ) : (
                        supportUsers.map((user) => (
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
                              </div>
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                className={getRoleBadgeColor(user.role)}
                                variant="outline"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.supportReason}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Open menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>
                                    Contact user
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    View details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Mark as resolved
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Assign to team
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
