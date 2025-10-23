import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsersTable from "./users-table";
import { getUsers } from "@/app/api/users/users-service";

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

  const users = await getUsers();

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
            <Card>
              <CardHeader className="pb-1">
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4 mt-2">
                  <SearchForm initialQuery={query} />
                  <ServerRefreshButton />
                </div>

                <UsersTable users={users} />
              </CardContent>
            </Card>
      </div>
    </div>
  );
}
