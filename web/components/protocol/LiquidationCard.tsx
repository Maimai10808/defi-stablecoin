"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatUnits, isAddress, parseUnits } from "viem";
import { useReadContract } from "wagmi";

import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscLiquidation } from "@/hooks/useDscLiquidation";
import { dscEngineAbi } from "@/lib/contracts/abi";
import {
  COLLATERAL_OPTIONS,
  type CollateralSymbol,
  getAddressKeyForSymbol,
} from "@/lib/protocol/collateral";

function format18(value?: bigint) {
  if (value === undefined) return "--";
  return Number(formatUnits(value, 18)).toFixed(4);
}

function isPositiveNumber(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0;
}

export function LiquidationCard() {
  const [collateralSymbol, setCollateralSymbol] =
    useState<CollateralSymbol>("WETH");
  const [targetUser, setTargetUser] = useState("");
  const [debtToCover, setDebtToCover] = useState("50");

  const liquidateFlow = useDscLiquidation();
  const accountOverview = useDscAccountOverview();

  const selectedAddressKey = getAddressKeyForSymbol(collateralSymbol);
  const collateralAddress = selectedAddressKey
    ? liquidateFlow.contracts?.[selectedAddressKey]
    : undefined;
  const validTarget = isAddress(targetUser);

  const targetHealthFactorQuery = useReadContract({
    address: liquidateFlow.contracts?.dscEngine as `0x${string}` | undefined,
    abi: dscEngineAbi,
    functionName: "getHealthFactor",
    args: validTarget ? [targetUser as `0x${string}`] : undefined,
    query: {
      enabled: Boolean(
        liquidateFlow.enabled &&
          liquidateFlow.contracts?.dscEngine &&
          validTarget,
      ),
    },
  });

  const minHealthFactorQuery = useReadContract({
    address: liquidateFlow.contracts?.dscEngine as `0x${string}` | undefined,
    abi: dscEngineAbi,
    functionName: "getMinHealthFactor",
    query: {
      enabled: Boolean(liquidateFlow.enabled && liquidateFlow.contracts?.dscEngine),
    },
  });

  const payoutPreviewQuery = useReadContract({
    address: liquidateFlow.contracts?.dscEngine as `0x${string}` | undefined,
    abi: dscEngineAbi,
    functionName: "getTokenAmountFromUsd",
    args:
      collateralAddress && isPositiveNumber(debtToCover)
        ? [collateralAddress as `0x${string}`, parseUnits(debtToCover, 18)]
        : undefined,
    query: {
      enabled: Boolean(
        liquidateFlow.enabled &&
          collateralAddress &&
          isPositiveNumber(debtToCover),
      ),
    },
  });

  const currentStatus = useMemo(() => {
    if (liquidateFlow.status.message) return liquidateFlow.status.message;
    return "Ready";
  }, [liquidateFlow.status.message]);

  const disabled =
    !liquidateFlow.enabled ||
    liquidateFlow.status.isPending ||
    !validTarget ||
    !isPositiveNumber(debtToCover);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await liquidateFlow.liquidate(
      collateralSymbol,
      targetUser as `0x${string}`,
      debtToCover,
    );
  };

  const targetHealthFactor =
    targetHealthFactorQuery.data !== undefined
      ? (targetHealthFactorQuery.data as bigint)
      : undefined;
  const minHealthFactor =
    minHealthFactorQuery.data !== undefined
      ? (minHealthFactorQuery.data as bigint)
      : undefined;
  const previewBasePayout =
    payoutPreviewQuery.data !== undefined
      ? (payoutPreviewQuery.data as bigint)
      : undefined;
  const previewBonusPayout =
    previewBasePayout !== undefined
      ? previewBasePayout + previewBasePayout / BigInt(10)
      : undefined;

  return (
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div>
        <div className="cyber-kicker">Liquidator Console</div>
        <h2 className="cyber-title mt-3">Liquidation</h2>
        <p className="cyber-description mt-2 text-sm">
          Minimal liquidator view for covering unsafe debt and receiving
          collateral plus the liquidation bonus.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="liquidation-collateral"
              className="cyber-label"
            >
              Collateral
            </label>
            <div className="cyber-select-wrap">
              <select
                id="liquidation-collateral"
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
            <label htmlFor="liquidation-debt" className="cyber-label">
              Debt To Cover (DSC)
            </label>
            <div className="cyber-input-wrap">
              <input
                id="liquidation-debt"
                type="number"
                min="0"
                step="any"
                value={debtToCover}
                onChange={(event) => setDebtToCover(event.target.value)}
                className="cyber-input"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="liquidation-target" className="cyber-label">
            Target Wallet
          </label>
          <div className="cyber-input-wrap">
            <input
              id="liquidation-target"
              value={targetUser}
              onChange={(event) => setTargetUser(event.target.value.trim())}
              placeholder="0x..."
              className="cyber-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <ActionInfoRow label="Status" value={currentStatus} />
          <ActionInfoRow
            label="Target Health Factor"
            value={format18(targetHealthFactor)}
            valueClassName={
              targetHealthFactor !== undefined &&
              minHealthFactor !== undefined &&
              targetHealthFactor < minHealthFactor
                ? "text-red-500"
                : ""
            }
          />
          <ActionInfoRow
            label="Minimum Safe Health Factor"
            value={format18(minHealthFactor)}
          />
          <ActionInfoRow
            label={`Estimated ${collateralSymbol} From Debt`}
            value={format18(previewBasePayout)}
          />
          <ActionInfoRow
            label={`Estimated ${collateralSymbol} With 10% Bonus`}
            value={format18(previewBonusPayout)}
          />
          <ActionInfoRow
            label="Liquidator DSC Balance"
            value={accountOverview.overview.formatted.dscBalance ?? "--"}
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={disabled}
            className="cyber-button flex-1"
          >
            {liquidateFlow.status.isPending
              ? "Processing..."
              : "Approve + Liquidate"}
          </button>
          <button
            type="button"
            onClick={liquidateFlow.reset}
            disabled={liquidateFlow.status.isPending}
            className="cyber-button cyber-button-ghost"
          >
            Reset
          </button>
        </div>
      </form>
    </section>
  );
}
