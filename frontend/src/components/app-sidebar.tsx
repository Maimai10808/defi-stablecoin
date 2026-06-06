"use client";

import * as React from "react";

import { SearchForm } from "@/components/search-form";
import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { MotionSidebarIndicator } from "@/components/motion";

export type DashboardView =
  | "project-guide"
  | "protocol-flow"
  | "how-it-works"
  | "feature-map"
  | "protocol-status"
  | "my-position"
  | "protocol-3d-overview"
  | "faucet"
  | "deposit-mint"
  | "repay-redeem"
  | "health-factor"
  | "liquidation-demo"
  | "activity-log"
  | "contract-addresses";

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
};

const versions = ["Local Anvil", "Sepolia", "Mainnet"];

const navMain = [
  {
    title: "Demo Flow",
    items: [
      {
        title: "Project Guide",
        value: "project-guide",
      },
      {
        title: "Protocol Flow",
        value: "protocol-flow",
      },
      {
        title: "Account Overview",
        value: "my-position",
      },
    ],
  },
  {
    title: "Supporting Tools",
    items: [
      {
        title: "Faucet",
        value: "faucet",
      },
      {
        title: "Protocol Status",
        value: "protocol-status",
      },
      {
        title: "Activity Log",
        value: "activity-log",
      },
      {
        title: "Contract Addresses",
        value: "contract-addresses",
      },
    ],
  },
] satisfies Array<{
  title: string;
  items: Array<{
    title: string;
    value: DashboardView;
  }>;
}>;

export function AppSidebar({
  activeView,
  onViewChange,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={versions} defaultVersion={versions[0]} />
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton
                      type="button"
                      isActive={activeView === item.value}
                      onClick={() => onViewChange(item.value)}
                    >
                      <MotionSidebarIndicator
                        active={activeView === item.value}
                        className="w-full"
                      >
                        {item.title}
                      </MotionSidebarIndicator>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
