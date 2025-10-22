import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersTable from "./users-table";
import { ApplicationsTable } from "./applications-table";
import { getUsers } from "@/app/api/users/users-service";
import type { User } from "@/app/api/users/types";
import SearchForm from "./search-form";
import { ServerRefreshButton } from "./server-refresh-button";

// Re-export types from the API service
export type { User, UserRole } from "@/app/api/users/types";

interface PageProps {
  searchParams?: Promise<{ query?: string }>;
}

export default async function UserManagement({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = params?.query || "";
  
  // Fetch users from the API service
  const users = await getUsers();

  // For now, applications tab shows empty until we have a separate endpoint
  const supportUsers: User[] = [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
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
                  <SearchForm initialQuery={query} />
                  <ServerRefreshButton />
                </div>

                <UsersTable users={users} />
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
                  <ServerRefreshButton />
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
