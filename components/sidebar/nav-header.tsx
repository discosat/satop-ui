import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Image from "next/image";

export function Navheader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
            <Image
              src="/assets/logo.png"
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
  );
}
