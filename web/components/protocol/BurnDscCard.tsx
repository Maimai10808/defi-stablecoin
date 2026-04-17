"use client";

import { FormEvent, useMemo, useState } from "react";

import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { ActionPrimaryButton } from "@/components/dsc/ActionPrimaryButton";
import { ActionSecondaryButton } from "@/components/dsc/ActionSecondaryButton";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscBurnDsc } from "@/hooks/useDscBurnDsc";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";

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
    <section className="cyber-panel cyber-panel-hover cyber-panel-terminal p-5 md:p-6">
      <div>
        <div className="cyber-terminal-bar">
          <span className="cyber-terminal-dot text-[var(--destructive)]" />
          <span className="cyber-terminal-dot text-[var(--accent-secondary)]" />
          <span className="cyber-terminal-dot text-[var(--accent)]" />
          protocol/burn
        </div>
        <h2 className="cyber-title mt-4">Burn DSC</h2>
        <p className="cyber-description mt-2 text-sm">
          Minimal burn flow for local protocol testing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="burn-dsc-amount" className="cyber-label">
            DSC Amount
          </label>
          <div className="cyber-input-wrap">
            <input
              id="burn-dsc-amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="cyber-input"
              placeholder="100"
            />
          </div>
        </div>

        <ActionInfoRow label="Status" value={currentStatus} />
        <ActionInfoRow label="Wallet" value={burnFlow.address ?? "--"} />
        <ActionInfoRow
          label="Current Total DSC Minted"
          value={accountOverview.overview.formatted.totalDscMinted ?? "--"}
        />
        <ActionInfoRow
          label="Current DSC Balance"
          value={accountOverview.overview.formatted.dscBalance ?? "--"}
        />
        <ActionInfoRow
          label="Current Collateral Value"
          value={
            accountOverview.overview.formatted.collateralValueInUsd ?? "--"
          }
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
            {burnFlow.status.isPending ? "Processing..." : "Approve + Burn DSC"}
          </ActionPrimaryButton>

          <ActionSecondaryButton
            type="button"
            onClick={burnFlow.reset}
            disabled={burnFlow.status.isPending}
          >
            Reset
          </ActionSecondaryButton>
        </div>
      </form>
    </section>
  );
}
