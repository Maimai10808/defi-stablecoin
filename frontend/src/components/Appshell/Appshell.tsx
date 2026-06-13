"use client";

import * as React from "react";
import {
  Activity,
  ChevronDown,
  ShieldCheck,
  Wallet,
  WalletCards,
} from "lucide-react";
import {useAppKit} from "@reown/appkit/react";
import {useTranslations} from "next-intl";
import {useAccount} from "wagmi";

import {ActivityLog} from "@/components/activity-log";
import {AppSidebar, type DashboardView} from "@/components/app-sidebar";
import {ContractAddresses} from "@/components/contract-addresses";
import {DepositMint} from "@/components/deposit-mint";
import {Faucet} from "@/components/faucet";
import {FeatureMap} from "@/components/feature-map";
import {HealthFactor} from "@/components/health-factor";
import {HowItWorks} from "@/components/how-it-works";
import {LiquidationDemo} from "@/components/liquidation-demo";
import {MyPosition} from "@/components/my-position";
import {ProjectGuide} from "@/components/project-guide";
import {Protocol3DOverview} from "@/components/protocol-3d-overview";
import {ProtocolStatus} from "@/components/protocol-status";
import {ProtocolWorkspace} from "@/components/protocol";
import {RepayRedeem} from "@/components/repay-redeem";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {LocaleSwitcher} from "@/components/locale-switcher";
import {MotionPage, MotionPressable} from "@/components/motion";
import {shortAddress} from "@/lib/format";

function WalletConnectionButton() {
  const t = useTranslations("Common");
  const tShell = useTranslations("Shell");
  const {open} = useAppKit();
  const {address, isConnected} = useAccount();

  return (
    <MotionPressable>
      <Button
        type="button"
        size="sm"
        variant={isConnected ? "outline" : "default"}
        className={`group h-11 gap-2 px-3 transition-all ${
          isConnected
            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 shadow-[0_8px_24px_-12px_rgb(16_185_129)] hover:border-emerald-500 hover:bg-emerald-500/15"
            : "border-primary/30 shadow-[0_6px_20px_-10px_hsl(var(--primary))] hover:border-primary/60 hover:bg-primary/10"
        }`}
        onClick={() => open()}
        aria-label={
          isConnected
            ? tShell("openWallet", {address: shortAddress(address)})
            : t("connectWallet")
        }
      >
        <span
          className={`relative flex size-8 items-center justify-center rounded-lg ${
            isConnected
              ? "bg-emerald-500 text-white"
              : "bg-primary/12 text-primary"
          }`}
        >
          {isConnected ? (
            <WalletCards className="size-4" />
          ) : (
            <Wallet className="size-4" />
          )}

          <span
            className={`absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-background ${
              isConnected ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
        </span>

        <span className="hidden min-w-0 text-left sm:block">
          <span
            className={`block text-[10px] font-medium leading-none ${
              isConnected ? "text-emerald-600/80" : "text-muted-foreground"
            }`}
          >
            {isConnected ? t("walletConnected") : t("walletAccess")}
          </span>

          <span
            className={`mt-1 block rounded-md font-mono text-xs font-bold leading-none ${
              isConnected
                ? "bg-emerald-500/15 px-2 py-1 text-emerald-700"
                : "text-foreground"
            }`}
          >
            {isConnected ? shortAddress(address) : t("connectWallet")}
          </span>
        </span>

        <ChevronDown
          className={`size-3.5 transition-transform group-hover:translate-y-0.5 ${
            isConnected ? "text-emerald-600" : "text-muted-foreground"
          }`}
        />
      </Button>
    </MotionPressable>
  );
}

export default function AppShell() {
  const t = useTranslations("Shell");
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
        <header className="material-paper sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border/70 bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/85">
          <SidebarTrigger className="-ml-1" />

          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />

          <div className="min-w-0 flex-1">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate">
                    {t(`views.${activeView}.title`)}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher />
            <WalletConnectionButton />
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-24">
          <section className="rounded-lg border border-border/60 bg-card p-5 shadow-[var(--material-elevation-1)] md:p-6">
            <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Activity className="size-5" />
            </div>

            <h1 className="text-2xl font-semibold tracking-normal text-foreground md:text-3xl">
              {t(`views.${activeView}.title`)}
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              {t(`views.${activeView}.description`)}
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
          aria-label={t("openProtocolStatus")}
        >
          <ShieldCheck className="size-6" />
        </Button>
      </SidebarInset>
    </SidebarProvider>
  );
}
