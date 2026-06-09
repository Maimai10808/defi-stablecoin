"use client";

import * as React from "react";
import {
  Activity,
  ChevronDown,
  ShieldCheck,
  Wallet,
  WalletCards,
} from "lucide-react";
import { useAppKit } from "@reown/appkit/react";
import { useAccount } from "wagmi";

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
import { ProtocolWorkspace } from "@/components/protocol";
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
import { MotionPage, MotionPressable } from "@/components/motion";
import { shortAddress } from "@/lib/format";

const viewTitles: Record<DashboardView, string> = {
  "project-guide": "Project Guide",
  "protocol-flow": "Protocol Flow",
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
  "contract-addresses": "Addresses & Test Accounts",
};

const viewDescriptions: Record<DashboardView, string> = {
  "project-guide":
    "A guided introduction to the Decentralized StableCoin local demo.",
  "protocol-flow":
    "Follow the stablecoin lifecycle one focused action at a time.",
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
    "Inspect deployed contracts, price feeds, and local Anvil test credentials.",
};

function WalletConnectionButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  return (
    <MotionPressable className="ml-auto">
      <Button
        type="button"
        size="sm"
        variant={isConnected ? "outline" : "default"}
        className="group h-10 gap-2 border-primary/30 px-3 shadow-[0_6px_20px_-10px_hsl(var(--primary))] transition-colors hover:border-primary/60 hover:bg-primary/10"
        onClick={() => open()}
        aria-label={
          isConnected
            ? `Open connected wallet ${shortAddress(address)}`
            : "Connect wallet"
        }
      >
        <span className="relative flex size-7 items-center justify-center rounded-md bg-primary/12 text-primary">
          {isConnected ? (
            <WalletCards className="size-4" />
          ) : (
            <Wallet className="size-4" />
          )}
          <span
            className={`absolute -right-0.5 -bottom-0.5 size-2 rounded-full border-2 border-background ${
              isConnected ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block text-[10px] leading-none text-muted-foreground">
            {isConnected ? "Connected wallet" : "Wallet access"}
          </span>
          <span className="mt-1 block font-mono text-xs font-semibold leading-none">
            {isConnected ? shortAddress(address) : "Connect wallet"}
          </span>
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground transition-transform group-hover:translate-y-0.5" />
      </Button>
    </MotionPressable>
  );
}

export default function AppShell() {
  const [activeView, setActiveView] =
    React.useState<DashboardView>("project-guide");

  const renderActiveView = () => {
    switch (activeView) {
      case "project-guide":
        return <ProjectGuide />;

      case "protocol-flow":
        return <ProtocolWorkspace />;

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

          <WalletConnectionButton />
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
