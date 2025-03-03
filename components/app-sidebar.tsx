"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Frame,
  House,
  Map,
  PieChart,
  SatelliteDish,
  Settings2,
  SquareTerminal,
  User,
} from "lucide-react";
import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
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

const getBadge = (val?: number) => {
  return () =>
    new Promise<number>((res) => {
      setTimeout(() => {
        res(val ?? 0);
      }, 250);
    });
};

// This is sample data.
const data = {
  user: {
    name: "Martin Vad",
    email: "202007814@post.au.dk",
    //avatar: "/avatars/shadcn.jpg",
    avatar: "martin.jpeg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: House,
      isActive: true,
    },
    {
      title: "Flight planning",
      url: "/dashboard/flight",
      scope: "fp",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Ground stations",
      url: "/dashboard/ground-stations",
      icon: SatelliteDish,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      scope: "entities",
      icon: User,
      badge: getBadge(2),
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
  /*  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ], */
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
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
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
