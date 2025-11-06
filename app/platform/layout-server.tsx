// app/platform/layout-server.tsx
import { getSession } from "@/lib/session";
import { canAccessPlatform } from "@/lib/authorization";
import { redirect } from "next/navigation";
import DashboardLayout from "./layout";

/**
 * Server-side wrapper for platform layout that checks authorization
 */
export default async function PlatformLayoutServer({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Check if user is authenticated
  if (!session) {
    redirect("/login?returnTo=/platform");
  }

  // Check if user has access to platform (VIEWER or higher)
  if (!canAccessPlatform(session.user.role)) {
    redirect("/unauthorized");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
