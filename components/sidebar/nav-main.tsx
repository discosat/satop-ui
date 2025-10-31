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
import { SessionPayload } from "@/lib/types";

export function NavMain({
  items,
  groupLabel = "Platform",
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    scope?: string;
    items?: {
      title: string;
      url: string;
      scope?: string;
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

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
      <SidebarMenu>
        {allowedItems(session, items).map((item) => {
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

function allowedItems<T extends { scope?: string }>(
  session: SessionPayload | null,
  items: T[]
) {
  // No scope checking - all items allowed if user has session
  return session ? items : [];
}