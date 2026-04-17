"use client";

import { FormEvent, useMemo, useState } from "react";

import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscBurnDsc } from "@/hooks/useDscBurnDsc";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";

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

export function BurnDscCard() {
  const [amount, setAmount] = useState("100");

  const accountOverview = useDscAccountOverview();
  const collateralOverview = useDscCollateralOverview();

  const burnFlow = useDscBurnDsc({
    onSuccess: async () => {
      await Promise.all([
        accountOverview.readResult.refetch(),
        collateralOverview.readResult.refetch(),
      ]);
    },
  });

  const isDisabled =
    !burnFlow.enabled ||
    burnFlow.status.isPending ||
    !amount.trim() ||
    Number(amount) <= 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await burnFlow.burnDsc(amount);
  };

  const currentStatus = useMemo(() => {
    if (burnFlow.status.message) return burnFlow.status.message;
    switch (burnFlow.status.step) {
      case "idle":
        return "Ready";
      case "approving":
        return "Submitting approve...";
      case "approve-confirming":
        return "Waiting approve confirmation...";
      case "burning":
        return "Submitting burn...";
      case "burn-confirming":
        return "Waiting burn confirmation...";
      case "success":
        return "Burn transaction confirmed.";
      case "error":
        return burnFlow.error?.message ?? "Burn failed.";
      default:
        return "--";
    }
  }, [burnFlow.status, burnFlow.error]);

  return (
    <section className="rounded-2xl border p-4">
      <div>
        <h2 className="text-lg font-semibold">Burn DSC</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Minimal burn flow for local protocol testing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="burn-dsc-amount" className="text-sm font-medium">
            DSC Amount
          </label>
          <input
            id="burn-dsc-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            placeholder="100"
          />
        </div>

        <InfoRow label="Status" value={currentStatus} />
        <InfoRow label="Wallet" value={burnFlow.address ?? "--"} />
        <InfoRow
          label="Current Total DSC Minted"
          value={accountOverview.overview.formatted.totalDscMinted ?? "--"}
        />
        <InfoRow
          label="Current DSC Balance"
          value={accountOverview.overview.formatted.dscBalance ?? "--"}
        />
        <InfoRow
          label="Current Collateral Value"
          value={
            accountOverview.overview.formatted.collateralValueInUsd ?? "--"
          }
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
            {burnFlow.status.isPending ? "Processing..." : "Approve + Burn DSC"}
          </button>

          <button
            type="button"
            onClick={burnFlow.reset}
            disabled={burnFlow.status.isPending}
            className="rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
