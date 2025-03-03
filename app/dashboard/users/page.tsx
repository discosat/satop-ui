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
import {
  Bot,
  Eye,
  MoreHorizontal,
  Plus,
  RefreshCw,
  SatelliteDish,
  Search,
  ShieldUser,
  TestTubeDiagonal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditUserModal from "./editUserModal";

// Types
type UserRole = "viewer" | "scientist" | "admin" | "ground station";
type UserType = "machine" | "human";

interface User {
  id: string;
  name: string;
  email: string;
  type: UserType;
  role: UserRole;
  scopes?: string[];
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
    scopes: [],
    type: "human",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "2",
    name: "Sam Wilson",
    email: "sam@example.com",
    role: "scientist",
    scopes: ["fp.program", "fp.create"],
    type: "human",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
  },
  {
    id: "3",
    name: "Taylor Smith",
    email: "taylor@example.com",
    role: "viewer",
    type: "human",
    scopes: ["fp.program"],
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
  },
  {
    id: "4",
    name: "SDU Ground Station",
    email: "gssdu@discosat.dk",
    role: "ground station",
    type: "machine",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
  },
  {
    id: "5",
    name: "AU Ground Station",
    email: "gsau@discosat.dk",
    role: "ground station",
    type: "machine",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Morgan",
  },
  {
    id: "6",
    name: "Casey Brown",
    email: "casey@example.com",
    role: "scientist",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
    needsSupport: true,
    type: "human",
    supportReason:
      "I wish to photograph the disko islands for thermal springs.",
  },
];

interface RoleBadgeProps {
  role: UserRole;
}

function RoleBadge({ role }: RoleBadgeProps) {
  const classes = {
    admin: "bg-purple-800 text-purple-100 hover:bg-purple-800",
    scientist: "bg-blue-800 text-blue-100 hover:bg-blue-800",
    viewer: "bg-gray-800 text-gray-100 hover:bg-gray-800",
    "ground station": "bg-orange-800 text-orange-100 hover:bg-orange-800",
  };
  const icons = {
    admin: <ShieldUser className="w-4 h-4" />,
    scientist: <TestTubeDiagonal className="w-4 h-4" />,
    viewer: <Eye className="w-4 h-4" />,
    "ground station": <SatelliteDish className="w-4 h-4" />,
  };
  return (
    <Badge
      className={"capitalize inline-flex gap-1 " + classes[role]}
      variant="outline"
    >
      {icons[role]}
      <span>{role}</span>
    </Badge>
  );
}

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const user = {
    id: "1",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "Admin",
    scope: "team",
  };

  const handleSaveUser = (updatedUser) => {
    console.log("Saving updated user:", updatedUser);
    // Here you would typically update your state or call an API
  };

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
          <TabsList className="grid w-full lg:w-80 grid-cols-2">
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="support-users">
              Applications
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
                    <EditUserModal user={user} onSave={handleSaveUser} />
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
                                {user.scopes && user.scopes.length > 0 && (
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Badge className="bg-gray-800 text-gray-600 hover:bg-gray-800">
                                        +{user.scopes.length} scopes
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{user.scopes.join(", ")}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
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
                <CardTitle>Platform access applications</CardTitle>
                <CardDescription>
                  Approve access for applicants wanting access to the Discosat
                  platform.
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
                        <TableHead>Message</TableHead>
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
                              <RoleBadge role={user.role} />
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
