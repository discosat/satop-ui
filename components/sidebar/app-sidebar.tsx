"use client";

import * as React from "react";
import { House, Notebook, Satellite, SatelliteDish, User } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Navheader } from "./nav-header";

// This is sample data.
const data = {
  user: {
    name: "Martin Vad",
    email: "202007814@post.au.dk",
    avatar: "martin.jpeg",
  },
  platform: [
    {
      title: "Home",
      url: "/platform",
      icon: House,
      isActive: true,
    },
    {
      title: "Satellite Overpass",
      url: "/platform/satellite-overpass",
      icon: Satellite,
      isActive: true,
    },
    {
      title: "Flight planning",
      url: "/platform/flight",
      scope: "fp",
      icon: Notebook,
      isActive: true,
    },
    /* {
      title: "Terminal",
      url: "/platform/terminal",
      icon: SquareTerminal,
      isActive: true,
    }, */
  ],
  administration: [
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
        <Navheader />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.platform} groupLabel="Platform" />
        <NavMain items={data.administration} groupLabel="Administration" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
