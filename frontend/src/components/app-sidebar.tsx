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

export type DashboardView =
  | "protocol-status"
  | "my-position"
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
    title: "Overview",
    items: [
      {
        title: "Protocol Status",
        value: "protocol-status",
      },
      {
        title: "My Position",
        value: "my-position",
      },
    ],
  },
  {
    title: "Actions",
    items: [
      {
        title: "Faucet",
        value: "faucet",
      },
      {
        title: "Deposit & Mint",
        value: "deposit-mint",
      },
      {
        title: "Repay & Redeem",
        value: "repay-redeem",
      },
    ],
  },
  {
    title: "Risk",
    items: [
      {
        title: "Health Factor",
        value: "health-factor",
      },
      {
        title: "Liquidation Demo",
        value: "liquidation-demo",
      },
    ],
  },
  {
    title: "Dev Tools",
    items: [
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
                      isActive={activeView === item.value}
                      onClick={() => onViewChange(item.value)}
                    >
                      {item.title}
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
