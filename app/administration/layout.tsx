"use client";

import { useSession } from "@/app/context";
import { canAccessAdministration } from "@/lib/authorization";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/app/platform/layout";

export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!session) {
      router.push("/login?returnTo=/administration");
      return;
    }

    // Redirect to unauthorized if not admin
    if (!canAccessAdministration(session.user.role)) {
      router.push("/unauthorized");
    }
  }, [session, router]);

  // Show loading or nothing while checking
  if (!session || !canAccessAdministration(session.user.role)) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
