"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/app/context";
import type { SessionPayload } from "@/lib/types";
import type { UserRole } from "@/app/api/users/types";

export function NavMain({
  items,
  groupLabel = "Platform",
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    requiredRole?: UserRole;
    items?: {
      title: string;
      url: string;
      requiredRole?: UserRole;
    }[];
  }[];
  groupLabel?: string;
}) {
  const session = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredItems = allowedItems(session, items);

  // Don't render the group if there are no allowed items
  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          // Only calculate active state after mount to avoid hydration errors
          const isActive = mounted && pathname === item.url;
          const hasActiveSubItem = mounted && item.items?.some(
            (subItem) => pathname === subItem.url
          );

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                tooltip={item.title}
                isActive={isActive || hasActiveSubItem}
              >
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <SidebarMenuSub>
                  {allowedItems(session, item.items).map((subItem) => {
                    const isSubItemActive = mounted && pathname === subItem.url;
                    
                    return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={isSubItemActive}>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    );
                  })}
                </SidebarMenuSub>
              ) : null}
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

/**
 * Filter items based on user's role
 */
function allowedItems<T extends { requiredRole?: UserRole }>(
  session: SessionPayload | null,
  items: T[]
): T[] {
  // No session means no access
  if (!session) {
    return [];
  }

  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    OPERATOR: 2,
    ADMIN: 3,
  };

  const userRoleLevel = roleHierarchy[session.user.role];

  return items.filter((item) => {
    // If no role requirement, allow access
    if (!item.requiredRole) {
      return true;
    }

    // Check if user's role meets the requirement
    const requiredRoleLevel = roleHierarchy[item.requiredRole];
    return userRoleLevel >= requiredRoleLevel;
  });
}