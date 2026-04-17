"use client";

import { DepositCollateralCard } from "@/components/dsc/DepositCollateralCard";
import { RedeemCollateralCard } from "@/components/dsc/RedeemCollateralCard";
import { MintDscCard } from "../protocol/MintDscCard";
import { BurnDscCard } from "../protocol/BurnDscCard";

export function ProtocolActionsSection() {
  return (
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div>
        <div className="cyber-kicker">Manual Control</div>
        <h2 className="cyber-title mt-3">Protocol Actions</h2>
        <p className="cyber-description mt-2 text-sm">
          Local protocol write flows for deposit, mint, burn, and redeem
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <DepositCollateralCard />
        <MintDscCard />
        <BurnDscCard />
        <RedeemCollateralCard />
      </div>
    </section>
  );
}
