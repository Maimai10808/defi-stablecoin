"use client";

import { FormEvent, useMemo, useState } from "react";

import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";
import { useDscRedeemCollateral } from "@/hooks/useDscRedeemCollateral";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="break-all text-sm font-medium">{value ?? "--"}</span>
    </div>
  );
}

export function RedeemCollateralCard() {
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
    await redeemFlow.redeemWeth(amount);
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

  return (
    <section className="rounded-2xl border p-4">
      <div>
        <h2 className="text-lg font-semibold">Redeem Collateral</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Minimal WETH-only redeem flow for local protocol testing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="redeem-weth-amount" className="text-sm font-medium">
            WETH Amount
          </label>
          <input
            id="redeem-weth-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            placeholder="1"
          />
        </div>

        <InfoRow label="Status" value={currentStatus} />
        <InfoRow label="Wallet" value={redeemFlow.address ?? "--"} />
        <InfoRow
          label="Current WETH Deposited"
          value={collateralOverview.overview.formatted.wethDeposited ?? "--"}
        />
        <InfoRow
          label="Current Total Collateral Value"
          value={
            collateralOverview.overview.formatted.totalCollateralUsd ?? "--"
          }
        />
        <InfoRow
          label="Current Total DSC Minted"
          value={accountOverview.overview.formatted.totalDscMinted ?? "--"}
        />
        <InfoRow
          label="Current Health Factor"
          value={accountOverview.overview.formatted.healthFactor ?? "--"}
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className="rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {redeemFlow.status.isPending ? "Processing..." : "Redeem WETH"}
          </button>

          <button
            type="button"
            onClick={redeemFlow.reset}
            disabled={redeemFlow.status.isPending}
            className="rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
