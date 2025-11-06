// app/administration/layout-server.tsx
import { getSession } from "@/lib/session";
import { canAccessAdministration } from "@/lib/authorization";
import { redirect } from "next/navigation";
import DashboardLayout from "../platform/layout";

/**
 * Server-side wrapper for administration layout that checks authorization
 */
export default async function AdministrationLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Check if user is authenticated
  if (!session) {
    redirect("/login?returnTo=/administration");
  }

  // Check if user is admin
  if (!canAccessAdministration(session.user.role)) {
    redirect("/unauthorized");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
