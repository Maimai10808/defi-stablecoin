"use client";

import { FormEvent, useMemo, useState } from "react";

import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { ActionPrimaryButton } from "@/components/dsc/ActionPrimaryButton";
import { ActionSecondaryButton } from "@/components/dsc/ActionSecondaryButton";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";
import { useDscMintDsc } from "@/hooks/useDscMintDsc";

export function MintDscCard() {
  const [amount, setAmount] = useState("100");

  const accountOverview = useDscAccountOverview();
  const collateralOverview = useDscCollateralOverview();

  const mintFlow = useDscMintDsc({
    onSuccess: async () => {
      await Promise.all([
        accountOverview.readResult.refetch(),
        collateralOverview.readResult.refetch(),
      ]);
    },
  });

  const isDisabled =
    !mintFlow.enabled ||
    mintFlow.status.isPending ||
    !amount.trim() ||
    Number(amount) <= 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await mintFlow.mintDsc(amount);
  };

  const currentStatus = useMemo(() => {
    if (mintFlow.status.message) return mintFlow.status.message;

    switch (mintFlow.status.step) {
      case "idle":
        return "Ready";
      case "minting":
        return "Submitting mint...";
      case "mint-confirming":
        return "Waiting mint confirmation...";
      case "success":
        return "Mint transaction confirmed.";
      case "error":
        return mintFlow.error?.message ?? "Mint failed.";
      default:
        return "--";
    }
  }, [mintFlow.status, mintFlow.error]);

  return (
    <section className="cyber-panel cyber-panel-hover cyber-panel-terminal p-5 md:p-6">
      <div>
        <div className="cyber-terminal-bar">
          <span className="cyber-terminal-dot text-[var(--destructive)]" />
          <span className="cyber-terminal-dot text-[var(--accent-secondary)]" />
          <span className="cyber-terminal-dot text-[var(--accent)]" />
          protocol/mint
        </div>
        <h2 className="cyber-title mt-4">Mint DSC</h2>
        <p className="cyber-description mt-2 text-sm">
          Minimal mint flow for local protocol testing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="mint-dsc-amount" className="cyber-label">
            DSC Amount
          </label>
          <div className="cyber-input-wrap">
            <input
              id="mint-dsc-amount"
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
        <ActionInfoRow label="Wallet" value={mintFlow.address ?? "--"} />
        <ActionInfoRow
          label="Current Total DSC Minted"
          value={accountOverview.overview.formatted.totalDscMinted ?? "--"}
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
        <ActionInfoRow
          label="Current DSC Balance"
          value={accountOverview.overview.formatted.dscBalance ?? "--"}
        />

        <div className="flex gap-3">
          <ActionPrimaryButton
            type="submit"
            disabled={isDisabled}
            fullWidth={false}
            className="flex-1"
          >
            {mintFlow.status.isPending ? "Processing..." : "Mint DSC"}
          </ActionPrimaryButton>

          <ActionSecondaryButton
            type="button"
            onClick={mintFlow.reset}
            disabled={mintFlow.status.isPending}
          >
            Reset
          </ActionSecondaryButton>
        </div>
      </form>
    </section>
  );
}
