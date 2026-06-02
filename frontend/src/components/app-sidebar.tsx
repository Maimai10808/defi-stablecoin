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

const data = {
  versions: ["Local Anvil", "Sepolia", "Mainnet"],
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Protocol Status",
          url: "#protocol-status",
        },
        {
          title: "My Position",
          url: "#my-position",
        },
      ],
    },
    {
      title: "Actions",
      items: [
        {
          title: "Faucet",
          url: "#faucet",
        },
        {
          title: "Deposit & Mint",
          url: "#deposit-mint",
        },
        {
          title: "Repay & Redeem",
          url: "#repay-redeem",
        },
      ],
    },
    {
      title: "Risk",
      items: [
        {
          title: "Health Factor",
          url: "#health-factor",
        },
        {
          title: "Liquidation Demo",
          url: "#liquidation-demo",
        },
      ],
    },
    {
      title: "Dev Tools",
      items: [
        {
          title: "Activity Log",
          url: "#activity-log",
        },
        {
          title: "Contract Addresses",
          url: "#contract-addresses",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeHash, setActiveHash] = React.useState("#protocol-status");

  React.useEffect(() => {
    const updateActiveHash = () => {
      setActiveHash(window.location.hash || "#protocol-status");
    };

    updateActiveHash();

    window.addEventListener("hashchange", updateActiveHash);

    return () => {
      window.removeEventListener("hashchange", updateActiveHash);
    };
  }, []);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={activeHash === item.url}
                    >
                      <a href={item.url}>{item.title}</a>
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
