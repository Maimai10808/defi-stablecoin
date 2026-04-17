"use client";

import { useMemo, useState } from "react";

import { ActionCardShell } from "@/components/dsc/ActionCardShell";
import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { ActionPrimaryButton } from "@/components/dsc/ActionPrimaryButton";
import { ActionSecondaryButton } from "@/components/dsc/ActionSecondaryButton";
import { useDscDepositCollateral } from "@/hooks/useDscDepositCollateral";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";

function isValidPositiveNumber(value: string) {
  if (!value.trim()) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

export function DepositCollateralCard() {
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
      await depositFlow.approveAndDeposit(amount);

      await Promise.all([
        accountOverview.readResult.refetch(),
        collateralOverview.readResult.refetch(),
      ]);
    } catch {
      // hook state already handles error
    }
  };

  const handleReset = () => {
    setAmount("10");
  };

  return (
    <ActionCardShell
      title="Deposit Collateral"
      description="Minimal WETH-only deposit flow for local protocol testing"
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
            {depositFlow.isPending ? "Processing..." : "Approve + Deposit WETH"}
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
        <label htmlFor="deposit-amount" className="text-sm font-medium">
          WETH Amount
        </label>
        <input
          id="deposit-amount"
          type="number"
          min="0"
          step="0.0001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border px-3 py-2 outline-none"
          placeholder="Enter WETH amount"
        />
      </div>

      <div className="space-y-2">
        <ActionInfoRow
          label="Wallet"
          value={accountOverview.address ?? "Not connected"}
        />
        <ActionInfoRow
          label="Current WETH Deposited"
          value={
            collateralOverview.overview?.formatted?.wethDeposited ?? "0.0000"
          }
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
