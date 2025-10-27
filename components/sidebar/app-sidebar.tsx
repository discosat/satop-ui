"use client";

import * as React from "react";
import { House, Notebook, Satellite, SatelliteDish, User, Radio } from "lucide-react";

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
  platform: [
    {
      title: "Home",
      url: "/platform",
      icon: House,
      isActive: false,
    },
    {
      title: "Flight planning",
      url: "/platform/flight",
      icon: Notebook,
      isActive: false,
    },
    {
      title: "Overpass schedule",
      url: "/platform/satellite-overpass",
      icon: Satellite,
      isActive: false,
    },
    {
      title: "Satellite tracking",
      url: "/platform/satellite-tracking",
      icon: Radio,
      isActive: false,
    },
    
  ],
  administration: [
    {
      title: "Overview",
      url: "/administration",
      icon: House,
      isActive: false,
    },
    {
      title: "Ground stations",
      url: "/administration/ground-stations",
      icon: SatelliteDish,
      isActive: false,
    },
    {
      title: "Satellites",
      url: "/administration/satellites",
      icon: Satellite,
      isActive: false,
    },
    {
      title: "Users",
      url: "/administration/users",
      icon: User,
      isActive: false,
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
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
