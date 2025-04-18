"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import UsersTable from "./users-table";
import { ApplicationsTable } from "./applications-table";
import { RefreshButton } from "@/components/refresh-button";

// Types
export type UserRole = "viewer" | "Operator" | "scientist" | "admin" | "ground station";
export type UserType = "machine" | "human";

export interface User {
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
          <TabsList className="grid w-full lg:w-80 grid-cols-2">
            <TabsTrigger value="all-users">All Users</TabsTrigger>
            <TabsTrigger value="support-users">
              Applications
              {supportUsers.length > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 bg-red-600 px-3 text-white"
                >
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
                  <RefreshButton onClick={() => {}} />
                </div>

                <UsersTable filteredUsers={filteredUsers} />
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
                <div className="flex justify-end">
                  <RefreshButton onClick={() => {}} />
                </div>

                <ApplicationsTable supportUsers={supportUsers} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
