"use client";

import { FormEvent, useMemo, useState } from "react";

import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { ActionPrimaryButton } from "@/components/dsc/ActionPrimaryButton";
import { ActionSecondaryButton } from "@/components/dsc/ActionSecondaryButton";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";
import { useDscMintDsc } from "@/hooks/useDscMintDsc";
import {
  getProjectedPositionPreview,
  getSafetyStatusLabel,
} from "@/lib/protocol/positionPreview";
import {
  formatTokenAmount,
  safeParseTokenAmount,
} from "@/lib/protocol/tokenUnits";

export function MintDscCard() {
  const [amount, setAmount] = useState("100");

  const accountOverview = useDscAccountOverview();
  const collateralOverview = useDscCollateralOverview();
  const parsedAmount = safeParseTokenAmount(amount, 18);
  const preview = getProjectedPositionPreview({
    currentCollateralValueUsd: accountOverview.overview.raw.collateralValueInUsd,
    currentDebt: accountOverview.overview.raw.totalDscMinted,
    debtDelta: parsedAmount,
  });

  const issues = useMemo(() => {
    const nextIssues: string[] = [];

    if (amount.trim() && parsedAmount === undefined) {
      nextIssues.push("Enter a valid DSC mint amount.");
    }

    if (preview.willRevert) {
      nextIssues.push(
        "This transaction would make the position unsafe and will revert.",
      );
    }

    return nextIssues;
  }, [amount, parsedAmount, preview.willRevert]);

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
    Number(amount) <= 0 ||
    parsedAmount === undefined ||
    issues.length > 0;

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
        <ActionInfoRow
          label="Projected Total DSC Minted"
          value={formatTokenAmount(preview.projectedDebt, 18) ?? "--"}
        />
        <ActionInfoRow
          label="Projected Health Factor"
          value={formatTokenAmount(preview.projectedHealthFactor, 18) ?? "--"}
        />
        <ActionInfoRow
          label="Safety Status"
          value={getSafetyStatusLabel(preview)}
          valueClassName={preview.willRevert ? "text-red-500" : "text-[var(--accent-secondary)]"}
        />

        {issues.length > 0 ? (
          <div className="space-y-1">
            {issues.map((issue) => (
              <p key={issue} className="text-sm text-[var(--destructive)]">
                {issue}
              </p>
            ))}
          </div>
        ) : null}

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
