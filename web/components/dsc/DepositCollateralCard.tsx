"use client";

import { useMemo, useState } from "react";

import { ActionCardShell } from "@/components/dsc/ActionCardShell";
import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { ActionPrimaryButton } from "@/components/dsc/ActionPrimaryButton";
import { ActionSecondaryButton } from "@/components/dsc/ActionSecondaryButton";
import { useDscDepositCollateral } from "@/hooks/useDscDepositCollateral";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";
import {
  COLLATERAL_OPTIONS,
  type CollateralSymbol,
} from "@/lib/protocol/collateral";

function isValidPositiveNumber(value: string) {
  if (!value.trim()) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function DepositCollateralCard() {
  const [collateralSymbol, setCollateralSymbol] =
    useState<CollateralSymbol>("WETH");
  const [amount, setAmount] = useState("10");

  const depositFlow = useDscDepositCollateral();
  const accountOverview = useDscAccountOverview();
  const collateralOverview = useDscCollateralOverview();

  const canSubmit = useMemo(() => {
    return (
      depositFlow.enabled &&
      isValidPositiveNumber(amount) &&
      !depositFlow.isPending
    );
  }, [depositFlow.enabled, depositFlow.isPending, amount]);

  const handleDeposit = async () => {
    try {
      await depositFlow.approveAndDeposit(collateralSymbol, amount);

      await Promise.all([
        accountOverview.readResult.refetch(),
        collateralOverview.readResult.refetch(),
      ]);
    } catch {
      // hook state already handles error
    }
  };

  const handleReset = () => {
    setCollateralSymbol("WETH");
    setAmount("10");
  };

  const currentDeposited =
    collateralSymbol === "WBTC"
      ? collateralOverview.overview?.formatted?.wbtcDeposited
      : collateralOverview.overview?.formatted?.wethDeposited;

  return (
    <ActionCardShell
      title="Deposit Collateral"
      description="Deposit either WETH or WBTC to fund the vault"
      status={depositFlow.step}
      errorMessage={depositFlow.error ?? null}
      footer={
        <>
          <ActionPrimaryButton
            onClick={handleDeposit}
            disabled={!canSubmit}
            className="flex-1"
            fullWidth={false}
          >
            {depositFlow.isPending
              ? "Processing..."
              : `Approve + Deposit ${collateralSymbol}`}
          </ActionPrimaryButton>

          <ActionSecondaryButton
            onClick={handleReset}
            disabled={depositFlow.isPending}
          >
            Reset
          </ActionSecondaryButton>
        </>
      }
    >
      <div className="space-y-2">
        <label htmlFor="deposit-collateral" className="cyber-label">
          Collateral
        </label>
        <div className="cyber-select-wrap">
          <select
            id="deposit-collateral"
            value={collateralSymbol}
            onChange={(e) =>
              setCollateralSymbol(e.target.value as CollateralSymbol)
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
        <label htmlFor="deposit-amount" className="cyber-label">
          {collateralSymbol} Amount
        </label>
        <div className="cyber-input-wrap">
          <input
            id="deposit-amount"
            type="number"
            min="0"
            step="0.0001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="cyber-input"
            placeholder="enter collateral amount"
          />
        </div>
      </div>

      <div className="space-y-2">
        <ActionInfoRow
          label="Wallet"
          value={accountOverview.address ?? "Not connected"}
        />
        <ActionInfoRow
          label={`Current ${collateralSymbol} Deposited`}
          value={currentDeposited ?? "0.0000"}
        />
        <ActionInfoRow
          label="Total Collateral Value"
          value={
            collateralOverview.overview?.formatted?.totalCollateralUsd ??
            "0.0000"
          }
        />
      </div>
    </ActionCardShell>
  );
}
