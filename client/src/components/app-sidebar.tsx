import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Plus, Package } from "lucide-react";

interface AppSidebarProps {
  role: string;
  onCreateBooking?: () => void;
}

import StorezeeLogo from '../../../client/public/storezee_logo.png';

export function AppSidebar({ role, onCreateBooking }: AppSidebarProps) {
  const isSaathi = role === 'saathi';

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-lg">
            <img
              src={StorezeeLogo}
              alt="Storezee Logo"
              className="h-12 w-12"
            />
          </div>
          <div>
            <p className="text-sm font-semibold">Storezee</p>
            <p className="text-xs text-muted-foreground">
              {isSaathi ? 'Saathi' : 'Partner'} Portal
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard" data-testid="link-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isSaathi && (
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onCreateBooking} data-testid="link-create-booking">
                    <Plus className="h-4 w-4" />
                    <span>Create Booking</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
