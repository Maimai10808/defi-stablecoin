"use client";

import { FormEvent, useMemo, useState } from "react";
import { useReadContract, useReadContracts } from "wagmi";

import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";
import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscLiquidation } from "@/hooks/useDscLiquidation";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";
import {
  COLLATERAL_OPTIONS,
  type CollateralSymbol,
  getAddressKeyForSymbol,
} from "@/lib/protocol/collateral";
import { getLiquidationPreview } from "@/lib/protocol/liquidationPreview";
import { formatTokenAmount, normalizeTokenDecimals, safeParseTokenAmount } from "@/lib/protocol/tokenUnits";

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
  const validTarget = /^0x[a-fA-F0-9]{40}$/.test(targetUser);
  const parsedDebtToCover = safeParseTokenAmount(debtToCover, 18);

  const approval = useTokenApproval({
    tokenAddress: liquidateFlow.contracts?.dsc as `0x${string}` | undefined,
    spenderAddress:
      liquidateFlow.contracts?.dscEngine as `0x${string}` | undefined,
    ownerAddress: accountOverview.address as `0x${string}` | undefined,
    amount: parsedDebtToCover,
    enabled: Boolean(liquidateFlow.enabled && parsedDebtToCover),
  });

  const targetReadResult = useReadContracts({
    contracts:
      liquidateFlow.enabled &&
      liquidateFlow.contracts?.dscEngine &&
      collateralAddress &&
      validTarget
        ? [
            {
              address: liquidateFlow.contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getHealthFactor",
              args: [targetUser as `0x${string}`],
            },
            {
              address: liquidateFlow.contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getAccountInformation",
              args: [targetUser as `0x${string}`],
            },
            {
              address: liquidateFlow.contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getCollateralBalanceOfUser",
              args: [targetUser as `0x${string}`, collateralAddress as `0x${string}`],
            },
            {
              address: liquidateFlow.contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getMinHealthFactor",
            },
          ]
        : [],
    query: {
      enabled: Boolean(
        liquidateFlow.enabled &&
          liquidateFlow.contracts?.dscEngine &&
          collateralAddress &&
          validTarget,
      ),
    },
  });

  const payoutPreviewQuery = useReadContract({
    address: liquidateFlow.contracts?.dscEngine as `0x${string}` | undefined,
    abi: dscEngineAbi,
    functionName: "getTokenAmountFromUsd",
    args:
      collateralAddress && parsedDebtToCover !== undefined
        ? [collateralAddress as `0x${string}`, parsedDebtToCover]
        : undefined,
    query: {
      enabled: Boolean(
        liquidateFlow.enabled &&
          collateralAddress &&
          parsedDebtToCover !== undefined,
      ),
    },
  });

  const collateralDecimalsQuery = useReadContract({
    address: collateralAddress as `0x${string}` | undefined,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: Boolean(liquidateFlow.enabled && collateralAddress),
    },
  });

  const [targetHealthFactorResult, targetAccountInfoResult, targetCollateralBalanceResult, minHealthFactorResult] =
    targetReadResult.data ?? [];

  const targetHealthFactor =
    targetHealthFactorResult?.status === "success"
      ? (targetHealthFactorResult.result as bigint)
      : undefined;
  const targetAccountInfo =
    targetAccountInfoResult?.status === "success"
      ? (targetAccountInfoResult.result as readonly [bigint, bigint])
      : undefined;
  const targetDebt = targetAccountInfo?.[0];
  const targetCollateralValueUsd = targetAccountInfo?.[1];
  const targetCollateralBalance =
    targetCollateralBalanceResult?.status === "success"
      ? (targetCollateralBalanceResult.result as bigint)
      : undefined;
  const minHealthFactor =
    minHealthFactorResult?.status === "success"
      ? (minHealthFactorResult.result as bigint)
      : undefined;

  const previewBasePayout =
    payoutPreviewQuery.data !== undefined
      ? (payoutPreviewQuery.data as bigint)
      : undefined;
  const previewBonusPayout =
    previewBasePayout !== undefined
      ? previewBasePayout / BigInt(10)
      : undefined;
  const collateralDecimals =
    collateralDecimalsQuery.data !== undefined
      ? normalizeTokenDecimals(collateralDecimalsQuery.data as bigint)
      : 18;

  const liquidationPreview = useMemo(
    () =>
      getLiquidationPreview({
        debtToCover: parsedDebtToCover,
        targetHealthFactor,
        minHealthFactor,
        targetDebt,
        targetCollateralValueUsd,
        targetCollateralBalance,
        liquidatorDscBalance: accountOverview.overview.raw.dscBalance,
        liquidatorAllowance: approval.allowance,
        collateralPayout: previewBasePayout,
        collateralBonusPayout: previewBonusPayout,
      }),
    [
      parsedDebtToCover,
      targetHealthFactor,
      targetDebt,
      targetCollateralValueUsd,
      targetCollateralBalance,
      accountOverview.overview.raw.dscBalance,
      approval.allowance,
      previewBasePayout,
      previewBonusPayout,
    ],
  );

  const currentStatus = useMemo(() => {
    if (liquidateFlow.status.message) return liquidateFlow.status.message;
    if (!validTarget && targetUser) return "Enter a valid target wallet.";
    if (liquidationPreview.issues.length > 0) return liquidationPreview.issues[0];
    if (approval.needsApproval || liquidationPreview.needsApproval) {
      return "DSC approval will be requested before liquidation.";
    }
    return "Ready";
  }, [
    liquidateFlow.status.message,
    validTarget,
    targetUser,
    liquidationPreview.issues,
    liquidationPreview.needsApproval,
    approval.needsApproval,
  ]);

  const disabled =
    !liquidateFlow.enabled ||
    liquidateFlow.status.isPending ||
    !validTarget ||
    !isPositiveNumber(debtToCover) ||
    parsedDebtToCover === undefined ||
    !liquidationPreview.canLiquidate;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await liquidateFlow.liquidate(
      collateralSymbol,
      targetUser as `0x${string}`,
      debtToCover,
    );

    await Promise.all([
      accountOverview.readResult.refetch(),
      targetReadResult.refetch(),
      approval.refetchAllowance(),
    ]);
  };

  return (
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div>
        <div className="cyber-kicker">Liquidator Console</div>
        <h2 className="cyber-title mt-3">Liquidation</h2>
        <p className="cyber-description mt-2 text-sm">
          Covers unhealthy DSC debt with the liquidator&apos;s DSC and claims
          collateral plus the liquidation bonus.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="liquidation-collateral" className="cyber-label">
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
            label="Liquidator DSC Balance"
            value={accountOverview.overview.formatted.dscBalance ?? "--"}
          />
          <ActionInfoRow
            label="Liquidator DSC Allowance"
            value={formatTokenAmount(approval.allowance, 18) ?? "--"}
            valueClassName={
              liquidationPreview.needsApproval ? "text-yellow-400" : undefined
            }
          />
          <ActionInfoRow
            label="Target Health Factor"
            value={formatTokenAmount(targetHealthFactor, 18) ?? "--"}
            valueClassName={
              liquidationPreview.isTargetUnsafe ? "text-red-500" : undefined
            }
          />
          <ActionInfoRow
            label="Minimum Safe Health Factor"
            value={formatTokenAmount(minHealthFactor, 18) ?? "--"}
          />
          <ActionInfoRow
            label="Target Outstanding DSC Debt"
            value={formatTokenAmount(targetDebt, 18) ?? "--"}
          />
          <ActionInfoRow
            label={`Target ${collateralSymbol} Deposited`}
            value={formatTokenAmount(targetCollateralBalance, collateralDecimals) ?? "--"}
          />
          <ActionInfoRow
            label={`Estimated ${collateralSymbol} From Debt`}
            value={formatTokenAmount(previewBasePayout, collateralDecimals) ?? "--"}
          />
          <ActionInfoRow
            label={`Estimated ${collateralSymbol} Bonus`}
            value={formatTokenAmount(previewBonusPayout, collateralDecimals) ?? "--"}
          />
          <ActionInfoRow
            label="Projected Target DSC Debt"
            value={formatTokenAmount(liquidationPreview.projectedTargetDebt, 18) ?? "--"}
          />
          <ActionInfoRow
            label="Projected Target Health Factor"
            value={
              formatTokenAmount(
                liquidationPreview.projectedTargetHealthFactor,
                18,
              ) ?? "--"
            }
          />
          <ActionInfoRow
            label="Liquidation Status"
            value={liquidationPreview.canLiquidate ? "Liquidatable" : "Blocked"}
            valueClassName={
              liquidationPreview.canLiquidate
                ? "text-[var(--accent-secondary)]"
                : "text-red-500"
            }
          />
        </div>

        {liquidationPreview.issues.length > 0 ? (
          <div className="space-y-1">
            {liquidationPreview.issues.map((issue) => (
              <p key={issue} className="text-sm text-[var(--destructive)]">
                {issue}
              </p>
            ))}
          </div>
        ) : null}

        {liquidationPreview.needsApproval && parsedDebtToCover !== undefined ? (
          <p className="text-sm text-yellow-400">
            Current DSC allowance is below the requested liquidation amount. The
            button will request approval before sending the liquidation
            transaction.
          </p>
        ) : null}

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
