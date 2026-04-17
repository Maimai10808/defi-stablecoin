"use client";

import { FormEvent, useMemo, useState } from "react";

import { ActionCardShell } from "@/components/dsc/ActionCardShell";
import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscBurnAndRedeem } from "@/hooks/useDscBurnAndRedeem";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";
import { useDscDepositAndMint } from "@/hooks/useDscDepositAndMint";
import {
  COLLATERAL_OPTIONS,
  type CollateralSymbol,
} from "@/lib/protocol/collateral";

function isPositiveNumber(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0;
}

export function CombinedFlowSection() {
  const accountOverview = useDscAccountOverview();
  const collateralOverview = useDscCollateralOverview();

  return (
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div>
        <div className="cyber-kicker">High-Level Flow</div>
        <h2 className="cyber-title mt-3">Combined Flows</h2>
        <p className="cyber-description mt-2 text-sm">
          These map to the higher-level engine methods that demonstrate the full
          user journey more clearly than isolated function calls.
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DepositAndMintCard
          refresh={async () => {
            await Promise.all([
              accountOverview.readResult.refetch(),
              collateralOverview.readResult.refetch(),
            ]);
          }}
          collateralValueInUsd={
            accountOverview.overview.formatted.collateralValueInUsd ?? "--"
          }
          totalDscMinted={accountOverview.overview.formatted.totalDscMinted}
        />
        <BurnAndRedeemCard
          refresh={async () => {
            await Promise.all([
              accountOverview.readResult.refetch(),
              collateralOverview.readResult.refetch(),
            ]);
          }}
          dscBalance={accountOverview.overview.formatted.dscBalance}
          healthFactor={accountOverview.overview.formatted.healthFactor}
        />
      </div>
    </section>
  );
}

function DepositAndMintCard({
  refresh,
  collateralValueInUsd,
  totalDscMinted,
}: {
  refresh: () => Promise<void>;
  collateralValueInUsd: string;
  totalDscMinted: string | null | undefined;
}) {
  const [collateralSymbol, setCollateralSymbol] =
    useState<CollateralSymbol>("WETH");
  const [collateralAmount, setCollateralAmount] = useState("10");
  const [mintAmount, setMintAmount] = useState("100");

  const flow = useDscDepositAndMint({ onSuccess: refresh });

  const disabled =
    !flow.enabled ||
    flow.status.isPending ||
    !isPositiveNumber(collateralAmount) ||
    !isPositiveNumber(mintAmount);

  const statusLabel = useMemo(() => {
    if (flow.status.message) return flow.status.message;
    return "Ready";
  }, [flow.status.message]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await flow.depositAndMint(collateralSymbol, collateralAmount, mintAmount);
  };

  return (
    <ActionCardShell
      title="Deposit + Mint"
      description="Single user flow backed by depositCollateralAndMintDsc."
      status={statusLabel}
      errorMessage={flow.error?.message ?? null}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CollateralSelect
          value={collateralSymbol}
          onChange={setCollateralSymbol}
          inputId="combo-deposit-collateral"
        />

        <NumberField
          id="combo-deposit-amount"
          label={`${collateralSymbol} Amount`}
          value={collateralAmount}
          onChange={setCollateralAmount}
        />

        <NumberField
          id="combo-mint-amount"
          label="DSC To Mint"
          value={mintAmount}
          onChange={setMintAmount}
        />

        <div className="space-y-2">
          <ActionInfoRow
            label="Current Collateral Value"
            value={collateralValueInUsd}
          />
          <ActionInfoRow label="Current DSC Minted" value={totalDscMinted} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="cyber-button flex-1"
          >
            {flow.status.isPending ? "Processing..." : "Run Combined Flow"}
          </button>
          <button
            type="button"
            onClick={flow.reset}
            disabled={flow.status.isPending}
            className="cyber-button cyber-button-ghost"
          >
            Reset
          </button>
        </div>
      </form>
    </ActionCardShell>
  );
}

function BurnAndRedeemCard({
  refresh,
  dscBalance,
  healthFactor,
}: {
  refresh: () => Promise<void>;
  dscBalance: string | null | undefined;
  healthFactor: string | null | undefined;
}) {
  const [collateralSymbol, setCollateralSymbol] =
    useState<CollateralSymbol>("WETH");
  const [collateralAmount, setCollateralAmount] = useState("1");
  const [burnAmount, setBurnAmount] = useState("50");

  const flow = useDscBurnAndRedeem({ onSuccess: refresh });

  const disabled =
    !flow.enabled ||
    flow.status.isPending ||
    !isPositiveNumber(collateralAmount) ||
    !isPositiveNumber(burnAmount);

  const statusLabel = useMemo(() => {
    if (flow.status.message) return flow.status.message;
    return "Ready";
  }, [flow.status.message]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await flow.burnAndRedeem(collateralSymbol, collateralAmount, burnAmount);
  };

  return (
    <ActionCardShell
      title="Burn + Redeem"
      description="Single user flow backed by redeemCollateralForDsc."
      status={statusLabel}
      errorMessage={flow.error?.message ?? null}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <CollateralSelect
          value={collateralSymbol}
          onChange={setCollateralSymbol}
          inputId="combo-redeem-collateral"
        />

        <NumberField
          id="combo-redeem-amount"
          label={`${collateralSymbol} To Redeem`}
          value={collateralAmount}
          onChange={setCollateralAmount}
        />

        <NumberField
          id="combo-burn-amount"
          label="DSC To Burn"
          value={burnAmount}
          onChange={setBurnAmount}
        />

        <div className="space-y-2">
          <ActionInfoRow label="Current DSC Balance" value={dscBalance} />
          <ActionInfoRow label="Current Health Factor" value={healthFactor} />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="cyber-button flex-1"
          >
            {flow.status.isPending ? "Processing..." : "Run Combined Flow"}
          </button>
          <button
            type="button"
            onClick={flow.reset}
            disabled={flow.status.isPending}
            className="cyber-button cyber-button-ghost"
          >
            Reset
          </button>
        </div>
      </form>
    </ActionCardShell>
  );
}

function CollateralSelect({
  value,
  onChange,
  inputId,
}: {
  value: CollateralSymbol;
  onChange: (value: CollateralSymbol) => void;
  inputId: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="cyber-label">
        Collateral
      </label>
      <div className="cyber-select-wrap">
        <select
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value as CollateralSymbol)}
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
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="cyber-label">
        {label}
      </label>
      <div className="cyber-input-wrap">
        <input
          id={id}
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="cyber-input"
        />
      </div>
    </div>
  );
}
