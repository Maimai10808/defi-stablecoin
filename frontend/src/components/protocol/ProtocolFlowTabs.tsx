"use client";

import * as React from "react";
import { Coins, Flame, ShieldAlert, Undo2, WalletCards } from "lucide-react";

import { MotionPage } from "@/components/motion";
import { Button } from "@/components/ui/button";

import { CollateralDepositPanel } from "./CollateralDepositPanel";
import { LiquidationPanel } from "./LiquidationPanel";
import { MintDscPanel } from "./MintDscPanel";
import { RedeemCollateralPanel } from "./RedeemCollateralPanel";
import { RepayDscPanel } from "./RepayDscPanel";

const tabs = [
  { value: "deposit", label: "Deposit", icon: WalletCards },
  { value: "mint", label: "Mint DSC", icon: Coins },
  { value: "repay", label: "Repay DSC", icon: Flame },
  { value: "redeem", label: "Redeem", icon: Undo2 },
  { value: "liquidation", label: "Liquidation", icon: ShieldAlert },
] as const;

type ProtocolTab = (typeof tabs)[number]["value"];

export function ProtocolFlowTabs() {
  const [activeTab, setActiveTab] = React.useState<ProtocolTab>("deposit");

  return (
    <section className="w-full min-w-0 space-y-4">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5" role="tablist" aria-label="Protocol actions">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.value}
              variant={activeTab === tab.value ? "default" : "outline"}
              className="h-auto min-w-0 justify-start py-3"
              onClick={() => setActiveTab(tab.value)}
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs">
                {index + 1}
              </span>
              <Icon className="size-4" />
              <span className="truncate">{tab.label}</span>
            </Button>
          );
        })}
      </div>

      <MotionPage viewKey={activeTab} className="w-full min-w-0">
        {activeTab === "deposit" ? <CollateralDepositPanel /> : null}
        {activeTab === "mint" ? <MintDscPanel /> : null}
        {activeTab === "repay" ? <RepayDscPanel /> : null}
        {activeTab === "redeem" ? <RedeemCollateralPanel /> : null}
        {activeTab === "liquidation" ? <LiquidationPanel /> : null}
      </MotionPage>
    </section>
  );
}
