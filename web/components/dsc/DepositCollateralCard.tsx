"use client";

import { useMemo, useState } from "react";

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
      // error already handled in hook state
    }
  };

  return (
    <div className="rounded-2xl border p-5 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Deposit Collateral</h2>
        <p className="text-sm text-muted-foreground">
          Minimal WETH-only deposit flow for local protocol testing
        </p>
      </div>

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

      <div className="rounded-xl bg-muted/40 p-3 text-sm space-y-1">
        <div className="flex items-center justify-between">
          <span>Status</span>
          <span>{depositFlow.step}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Wallet</span>
          <span>{accountOverview.address ?? "Not connected"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Current WETH Deposited</span>
          <span>
            {collateralOverview.overview.formatted.wethDeposited ?? "0.0000"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>Total Collateral Value</span>
          <span>
            {collateralOverview.overview.formatted.totalCollateralUsd ??
              "0.0000"}
          </span>
        </div>
      </div>

      {depositFlow.error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-600">
          {depositFlow.error}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleDeposit}
        disabled={!canSubmit}
        className="w-full rounded-xl border px-4 py-2 font-medium disabled:opacity-50"
      >
        {depositFlow.isPending ? "Processing..." : "Approve + Deposit WETH"}
      </button>
    </div>
  );
}
