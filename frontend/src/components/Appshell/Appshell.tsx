"use client";

import * as React from "react";

import { ActivityLog } from "@/components/activity-log";
import { AppSidebar, type DashboardView } from "@/components/app-sidebar";
import { ContractAddresses } from "@/components/contract-addresses";
import { DepositMint } from "@/components/deposit-mint";
import { Faucet } from "@/components/faucet";
import { HealthFactor } from "@/components/health-factor";
import { LiquidationDemo } from "@/components/liquidation-demo";
import { MyPosition } from "@/components/my-position";
import { ProtocolStatus } from "@/components/protocol-status";
import { RepayRedeem } from "@/components/repay-redeem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const viewTitles: Record<DashboardView, string> = {
  "protocol-status": "Protocol Status",
  "my-position": "My Position",
  faucet: "Faucet",
  "deposit-mint": "Deposit & Mint",
  "repay-redeem": "Repay & Redeem",
  "health-factor": "Health Factor",
  "liquidation-demo": "Liquidation Demo",
  "activity-log": "Activity Log",
  "contract-addresses": "Contract Addresses",
};

export default function AppShell() {
  const [activeView, setActiveView] =
    React.useState<DashboardView>("protocol-status");

  const renderActiveView = () => {
    switch (activeView) {
      case "protocol-status":
        return <ProtocolStatus />;

      case "my-position":
        return <MyPosition />;

      case "faucet":
        return <Faucet />;

      case "deposit-mint":
        return <DepositMint />;

      case "repay-redeem":
        return <RepayRedeem />;

      case "health-factor":
        return <HealthFactor />;

      case "liquidation-demo":
        return <LiquidationDemo />;

      case "activity-log":
        return <ActivityLog />;

      case "contract-addresses":
        return <ContractAddresses />;

      default:
        return <ProtocolStatus />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{viewTitles[activeView]}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <section className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {viewTitles[activeView]}
            </h1>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Decentralized StableCoin local demo dashboard.
            </p>
          </section>

          {renderActiveView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
