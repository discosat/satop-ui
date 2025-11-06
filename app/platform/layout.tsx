"use client";
import * as React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import Link from "next/link";
import { useSession } from "@/app/context";
import { canAccessPlatform } from "@/lib/authorization";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!session) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname || "/platform")}`);
      return;
    }

    // Redirect to unauthorized if user doesn't have platform access
    if (!canAccessPlatform(session.user.role)) {
      router.push("/unauthorized");
    }
  }, [session, router, pathname]);

  // Show loading or nothing while checking authentication
  if (!session || !canAccessPlatform(session.user.role)) {
    return null;
  }

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = () => {
    if (!pathname)
      return [{ label: "Platform", href: "/platform", current: true }];

    // Split the path and filter out empty segments
    const segments = pathname.split("/").filter(Boolean);

    // Create breadcrumb items from path segments
    return segments.map((segment, index) => {
      // Build the href for this breadcrumb level
      const href = `/${segments.slice(0, index + 1).join("/")}`;

      // Check if this is the last segment (current page)
      const isCurrent = index === segments.length - 1;

      // Format label - capitalize first letter and replace dashes with spaces
      const label = segment
        .split(/[-_]/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      return { label, href, current: isCurrent };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <TooltipProvider>
      <SidebarProvider className="h-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col h-full">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem>
                        {crumb.current ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0 min-h-0">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
