"use client";

import * as React from "react";

import { ActivityLog } from "@/components/activity-log";
import { AppSidebar, type DashboardView } from "@/components/app-sidebar";
import { ContractAddresses } from "@/components/contract-addresses";
import { DepositMint } from "@/components/deposit-mint";
import { Faucet } from "@/components/faucet";
import { FeatureMap } from "@/components/feature-map";
import { HealthFactor } from "@/components/health-factor";
import { HowItWorks } from "@/components/how-it-works";
import { LiquidationDemo } from "@/components/liquidation-demo";
import { MyPosition } from "@/components/my-position";
import { ProjectGuide } from "@/components/project-guide";
import { Protocol3DOverview } from "@/components/protocol-3d-overview";
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
  "project-guide": "Project Guide",
  "how-it-works": "How It Works",
  "feature-map": "Feature Map",
  "protocol-status": "Protocol Status",
  "my-position": "My Position",
  "protocol-3d-overview": "3D Overview",
  faucet: "Faucet",
  "deposit-mint": "Deposit & Mint",
  "repay-redeem": "Repay & Redeem",
  "health-factor": "Health Factor",
  "liquidation-demo": "Liquidation Demo",
  "activity-log": "Activity Log",
  "contract-addresses": "Contract Addresses",
};

const viewDescriptions: Record<DashboardView, string> = {
  "project-guide":
    "A guided introduction to the Decentralized StableCoin local demo.",
  "how-it-works":
    "Understand how the local chain, smart contracts, generated hooks, and UI work together.",
  "feature-map": "A feature-level map of every module in this DSC dashboard.",
  "protocol-status":
    "Check whether the local protocol, wallet, network, and deployed contracts are ready.",
  "my-position":
    "View your collateral, minted DSC, wallet balances, allowance, and risk status.",
  "protocol-3d-overview":
    "Visualize the DSC protocol flow from wallet collateral to minting and liquidation risk.",
  faucet:
    "Mint local mock collateral tokens for testing deposit and mint flows.",
  "deposit-mint":
    "Deposit collateral into DSCEngine and mint DSC against your position.",
  "repay-redeem":
    "Repay DSC debt and redeem deposited collateral from the protocol.",
  "health-factor":
    "Analyze the liquidation risk of your account through the protocol health factor.",
  "liquidation-demo":
    "Simulate and understand how unsafe positions can be liquidated.",
  "activity-log":
    "Review recent demo operations, frontend actions, and transaction records.",
  "contract-addresses":
    "Inspect deployed contract addresses, token mocks, and price feed addresses.",
};

export default function AppShell() {
  const [activeView, setActiveView] =
    React.useState<DashboardView>("project-guide");

  const renderActiveView = () => {
    switch (activeView) {
      case "project-guide":
        return <ProjectGuide />;

      case "how-it-works":
        return <HowItWorks />;

      case "feature-map":
        return <FeatureMap />;

      case "protocol-status":
        return <ProtocolStatus />;

      case "my-position":
        return <MyPosition />;

      case "protocol-3d-overview":
        return <Protocol3DOverview />;

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
        return <ProjectGuide />;
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
              {viewDescriptions[activeView]}
            </p>
          </section>

          {renderActiveView()}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
