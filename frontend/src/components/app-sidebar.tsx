"use client";

import * as React from "react";
import {useTranslations} from "next-intl";

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
    titleKey: "demoFlow",
    items: [
      {
        titleKey: "projectGuide",
        value: "project-guide",
      },
      {
        titleKey: "protocolFlow",
        value: "protocol-flow",
      },
      {
        titleKey: "myPosition",
        value: "my-position",
      },
    ],
  },
  {
    titleKey: "supportingTools",
    items: [
      {
        titleKey: "faucet",
        value: "faucet",
      },
      {
        titleKey: "protocolStatus",
        value: "protocol-status",
      },
      {
        titleKey: "healthFactor",
        value: "health-factor",
      },
      {
        titleKey: "activityLog",
        value: "activity-log",
      },
      {
        titleKey: "addresses",
        value: "contract-addresses",
      },
    ],
  },
] satisfies Array<{
  titleKey: string;
  items: Array<{
    titleKey: string;
    value: DashboardView;
  }>;
}>;

export function AppSidebar({
  activeView,
  onViewChange,
  ...props
}: AppSidebarProps) {
  const t = useTranslations("Sidebar");

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher versions={versions} defaultVersion={versions[0]} />
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.titleKey}>
            <SidebarGroupLabel>{t(group.titleKey)}</SidebarGroupLabel>

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
                        {t(item.titleKey)}
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
