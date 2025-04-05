"use client";

import * as React from "react";
import { House, SatelliteDish, SquareTerminal, User } from "lucide-react";
import Image from "next/image";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "Martin Vad",
    email: "202007814@post.au.dk",
    avatar: "martin.jpeg",
  },
  navMain: [
    {
      title: "Home",
      url: "/platform",
      icon: House,
      isActive: true,
    },
    {
      title: "Satellite Overpass",
      url: "/platform/satellite-overpass",
      icon: SatelliteDish,
      isActive: true,
    },
    {
      title: "Flight planning",
      url: "/platform/flight",
      scope: "fp",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Ground stations",
      url: "/platform/ground-stations",
      icon: SatelliteDish,
    },
    {
      title: "Users",
      url: "/platform/users",
      scope: "entities",
      icon: User,
      badge: 1,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <Image
                  src="/logo.png"
                  width={96}
                  height={96}
                  className=""
                  alt="Mission Control Logo"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Discosat</span>
                <span className="truncate text-xs">Operations</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
