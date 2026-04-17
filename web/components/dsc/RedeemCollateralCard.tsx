"use client";

import { FormEvent, useMemo, useState } from "react";

import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { ActionPrimaryButton } from "@/components/dsc/ActionPrimaryButton";
import { ActionSecondaryButton } from "@/components/dsc/ActionSecondaryButton";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";
import { useDscRedeemCollateral } from "@/hooks/useDscRedeemCollateral";
import {
  COLLATERAL_OPTIONS,
  type CollateralSymbol,
} from "@/lib/protocol/collateral";

export function RedeemCollateralCard() {
  const [collateralSymbol, setCollateralSymbol] =
    useState<CollateralSymbol>("WETH");
  const [amount, setAmount] = useState("1");

  const accountOverview = useDscAccountOverview();
  const collateralOverview = useDscCollateralOverview();

  const redeemFlow = useDscRedeemCollateral({
    onSuccess: async () => {
      await Promise.all([
        accountOverview.readResult.refetch(),
        collateralOverview.readResult.refetch(),
      ]);
    },
  });

  const isDisabled =
    !redeemFlow.enabled ||
    redeemFlow.status.isPending ||
    !amount.trim() ||
    Number(amount) <= 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await redeemFlow.redeemCollateral(collateralSymbol, amount);
  };

  const currentStatus = useMemo(() => {
    if (redeemFlow.status.message) return redeemFlow.status.message;

    switch (redeemFlow.status.step) {
      case "idle":
        return "Ready";
      case "redeeming":
        return "Submitting redeem...";
      case "redeem-confirming":
        return "Waiting redeem confirmation...";
      case "success":
        return "Redeem transaction confirmed.";
      case "error":
        return redeemFlow.error?.message ?? "Redeem failed.";
      default:
        return "--";
    }
  }, [redeemFlow.status, redeemFlow.error]);

  const currentDeposited =
    collateralSymbol === "WBTC"
      ? collateralOverview.overview.formatted.wbtcDeposited
      : collateralOverview.overview.formatted.wethDeposited;

  return (
    <section className="cyber-panel cyber-panel-hover cyber-panel-terminal p-5 md:p-6">
      <div>
        <div className="cyber-terminal-bar">
          <span className="cyber-terminal-dot text-[var(--destructive)]" />
          <span className="cyber-terminal-dot text-[var(--accent-secondary)]" />
          <span className="cyber-terminal-dot text-[var(--accent)]" />
          protocol/redeem
        </div>
        <h2 className="cyber-title mt-4">Redeem Collateral</h2>
        <p className="cyber-description mt-2 text-sm">
          Redeem either WETH or WBTC from the vault
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="redeem-collateral" className="cyber-label">
            Collateral
          </label>
          <div className="cyber-select-wrap">
            <select
              id="redeem-collateral"
              value={collateralSymbol}
              onChange={(event) =>
                setCollateralSymbol(event.target.value as CollateralSymbol)
              }
              className="cyber-select"
            >
              {COLLATERAL_OPTIONS.map((option) => (
                <option key={option.symbol} value={option.symbol}>
                  {option.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="redeem-weth-amount" className="cyber-label">
            {collateralSymbol} Amount
          </label>
          <div className="cyber-input-wrap">
            <input
              id="redeem-weth-amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="cyber-input"
              placeholder="1"
            />
          </div>
        </div>

        <ActionInfoRow label="Status" value={currentStatus} />
        <ActionInfoRow label="Wallet" value={redeemFlow.address ?? "--"} />
        <ActionInfoRow
          label={`Current ${collateralSymbol} Deposited`}
          value={currentDeposited ?? "--"}
        />
        <ActionInfoRow
          label="Current Total Collateral Value"
          value={
            collateralOverview.overview.formatted.totalCollateralUsd ?? "--"
          }
        />
        <ActionInfoRow
          label="Current Total DSC Minted"
          value={accountOverview.overview.formatted.totalDscMinted ?? "--"}
        />
        <ActionInfoRow
          label="Current Health Factor"
          value={accountOverview.overview.formatted.healthFactor ?? "--"}
        />

        <div className="flex gap-3">
          <ActionPrimaryButton
            type="submit"
            disabled={isDisabled}
            fullWidth={false}
            className="flex-1"
          >
            {redeemFlow.status.isPending
              ? "Processing..."
              : `Redeem ${collateralSymbol}`}
          </ActionPrimaryButton>

          <ActionSecondaryButton
            type="button"
            onClick={redeemFlow.reset}
            disabled={redeemFlow.status.isPending}
          >
            Reset
          </ActionSecondaryButton>
        </div>
      </form>
    </section>
  );
}
