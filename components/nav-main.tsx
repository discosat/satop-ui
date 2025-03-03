"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSession } from "@/app/context";
import { hasScope } from "@/lib/user";
import { SessionPayload } from "@/lib/session";
import { Badge } from "./ui/badge";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    scope?: string;
    badge?: number;
    items?: {
      title: string;
      url: string;
      scope?: string;
    }[];
  }[];
}) {
  const session = useSession();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {allowedItems(session, items).map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="ml-0">
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {allowedItems(session, item.items).map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

function allowedItems<T extends { scope?: string }>(
  session: SessionPayload | null,
  items: T[],
) {
  return items.filter(({ scope }) => {
    console.log({
      scope,
      session,
      has: hasScope(session, scope ?? ""),
    });
    return !scope || hasScope(session, scope);
  });
}
