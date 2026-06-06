"use client";

import * as React from "react";
import { Activity, ShieldCheck } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { MotionPage } from "@/components/motion";

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
        <header className="material-paper sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/85">
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

        <main className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-24">
          <section className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--material-elevation-1)] md:p-6">
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>

            <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
              {viewTitles[activeView]}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {viewDescriptions[activeView]}
            </p>
          </section>

          <MotionPage viewKey={activeView} className="w-full min-w-0 space-y-6">
            {renderActiveView()}
          </MotionPage>
        </main>

        <Button
          type="button"
          size="icon-lg"
          className="material-fab fixed right-5 bottom-5 z-20 hidden size-14 rounded-full sm:inline-flex md:right-7 md:bottom-7"
          onClick={() => setActiveView("protocol-status")}
          aria-label="Open protocol status"
        >
          <ShieldCheck className="size-6" />
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
