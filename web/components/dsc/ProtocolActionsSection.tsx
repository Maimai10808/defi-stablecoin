"use client";

import { DepositCollateralCard } from "@/components/dsc/DepositCollateralCard";
import { RedeemCollateralCard } from "@/components/dsc/RedeemCollateralCard";
import { MintDscCard } from "../protocol/MintDscCard";
import { BurnDscCard } from "../protocol/BurnDscCard";

export function ProtocolActionsSection() {
  return (
    <section className="rounded-2xl border p-4">
      <div>
        <h2 className="text-lg font-semibold">Protocol Actions</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Local protocol write flows for deposit, mint, burn, and redeem
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <DepositCollateralCard />
        <MintDscCard />
        <BurnDscCard />
        <RedeemCollateralCard />
      </div>
    </section>
  );
}
