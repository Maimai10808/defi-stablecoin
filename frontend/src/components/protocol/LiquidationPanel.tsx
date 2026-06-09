"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShieldAlert,
  WalletCards,
} from "lucide-react";
import { formatEther } from "viem";

import { MotionHealthFactorText, MotionPressable, MotionValueText } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLiquidationDemo } from "@/hooks/use-liquidation-demo";
import { formatTokenAmount, shortAddress } from "@/lib/format";
import { getLiquidationErrorMessage } from "@/lib/liquidation";

import {
  bigintToNumber,
  LIQUIDATION_BONUS,
  MIN_HEALTH_FACTOR,
} from "./protocol-calculations";

type ActionStatus = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
};

export function LiquidationPanel() {
  const { wallet, form, updateField, liquidation, status } =
    useLiquidationDemo();
  const targetHealthFactor = toHealthFactor(liquidation.targetHealthFactor);
  const liquidatorHealthFactor = toHealthFactor(
    liquidation.liquidatorHealthFactor,
  );
  const liquidatorBalance = bigintToNumber(liquidation.liquidatorDscBalance);
  const allowance = bigintToNumber(liquidation.liquidatorDscAllowance);
  const debtToCover = bigintToNumber(liquidation.debtToCoverInWei);
  const baseCollateral = bigintToNumber(liquidation.collateralNeeded);
  const bonusCollateral = baseCollateral * LIQUIDATION_BONUS;
  const totalCollateral = baseCollateral + bonusCollateral;
  const targetRisk = getTargetRisk(
    targetHealthFactor,
    liquidation.targetDscDebt,
  );
  const actionStatus = getActionStatus(liquidation, wallet.hasWallet);
  const notice = getNotice(
    liquidation,
    status.previewError,
    status.hasReadError,
    wallet.hasWallet,
  );

  return (
    <Card className="w-full min-w-0 overflow-hidden">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4" />
              Liquidation
            </CardTitle>
            <CardDescription>
              Repay DSC debt for an unsafe account and receive collateral plus
              the protocol liquidation bonus.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                liquidation.isTargetLiquidatable ? "destructive" : "secondary"
              }
            >
              Target:{" "}
              {liquidation.isTargetLiquidatable
                ? "Liquidatable"
                : "Not liquidatable"}
            </Badge>
            <Badge variant={actionStatus.variant}>{actionStatus.label}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <Section title="Target account" icon={<ShieldAlert className="size-4" />}>
          <div className="space-y-2">
            <Label htmlFor="liquidation-target">User to liquidate</Label>
            <Input
              id="liquidation-target"
              value={form.userToLiquidate}
              placeholder="0x..."
              onChange={(event) =>
                updateField(
                  "userToLiquidate",
                  event.target.value as `0x${string}`,
                )
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Target Health Factor">
              <MotionHealthFactorText value={liquidation.targetHealthFactor} />
            </Metric>
            <Metric label="Target DSC debt">
              <MotionValueText
                value={liquidation.targetDscDebt}
                suffix=" DSC"
                decimals={2}
              />
            </Metric>
            <Metric label={`${form.collateralSymbol} deposited`}>
              {formatTokenAmount(
                liquidation.targetCollateralBalance,
                form.collateralSymbol,
              )}
            </Metric>
            <Metric label="Risk status">
              <Badge
                variant={
                  targetRisk === "Liquidatable" ? "destructive" : "secondary"
                }
              >
                {targetRisk}
              </Badge>
            </Metric>
          </div>
        </Section>

        <Section title="Liquidator" icon={<WalletCards className="size-4" />}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Connected wallet">
              <span className="font-mono text-sm">
                {shortAddress(wallet.address)}
              </span>
            </Metric>
            <Metric label="Liquidator DSC">
              {liquidatorBalance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              DSC
            </Metric>
            <Metric label="Liquidator Health Factor">
              {liquidation.liquidatorDscDebt === BigInt(0)
                ? "No debt"
                : liquidatorHealthFactor?.toFixed(2) ?? "Loading..."}
            </Metric>
            <Metric label="DSC allowance">
              {allowance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              DSC
            </Metric>
          </div>
        </Section>

        <Section
          title="Liquidation estimate"
          icon={<AlertTriangle className="size-4" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="liquidation-token">
                Collateral token to receive
              </Label>
              <select
                id="liquidation-token"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                value={form.collateralSymbol}
                onChange={(event) =>
                  updateField(
                    "collateralSymbol",
                    event.target.value as "WETH" | "WBTC",
                  )
                }
              >
                <option value="WETH">WETH</option>
                <option value="WBTC">WBTC</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="liquidation-debt">Debt to cover</Label>
              <Input
                id="liquidation-debt"
                value={form.debtToCover}
                inputMode="decimal"
                placeholder="1000"
                onChange={(event) =>
                  updateField("debtToCover", event.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Debt to cover">
              {debtToCover.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              DSC
            </Metric>
            <Metric label="Collateral without bonus">
              {formatCollateral(baseCollateral, form.collateralSymbol)}
            </Metric>
            <Metric label="Liquidation bonus">
              {formatCollateral(bonusCollateral, form.collateralSymbol)} (10%)
            </Metric>
            <Metric label="Total collateral to receive">
              {formatCollateral(totalCollateral, form.collateralSymbol)}
            </Metric>
          </div>

          <Notice>
            The liquidator repays{" "}
            {debtToCover.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}{" "}
            DSC for the target account and receives about{" "}
            {formatCollateral(totalCollateral, form.collateralSymbol)} in total,
            including the 10% liquidation bonus.
          </Notice>
        </Section>

        {notice ? <Notice destructive={notice.destructive}>{notice.text}</Notice> : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => updateField("debtToCover", "1000")}
          >
            Use Demo Debt Amount
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={status.isReading || !liquidation.isTargetAddressValid}
            onClick={liquidation.refresh}
          >
            <RefreshCw
              className={`size-4 ${status.isReading ? "animate-spin" : ""}`}
            />
            Refresh Target Position
          </Button>
          {liquidation.canApprove ? (
            <MotionPressable disabled={liquidation.isApproving}>
              <Button
                type="button"
                variant="secondary"
                disabled={liquidation.isApproving}
                onClick={liquidation.approveDsc}
              >
                {liquidation.isApproving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {liquidation.isApproving ? "Approving..." : "Approve DSC"}
              </Button>
            </MotionPressable>
          ) : !liquidation.needsDscApproval &&
            liquidation.hasDebtToCover &&
            liquidation.liquidatorDscAllowance !== undefined ? (
            <Button type="button" variant="outline" disabled>
              <CheckCircle2 className="size-4" />
              Approved
            </Button>
          ) : null}
          <MotionPressable disabled={!liquidation.canLiquidate}>
            <Button
              type="button"
              disabled={!liquidation.canLiquidate || liquidation.isSubmitting}
              onClick={liquidation.liquidate}
            >
              {liquidation.isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Liquidate Position
            </Button>
          </MotionPressable>
        </div>

        <div className="rounded-md border bg-muted/20 p-4 text-sm">
          <p className="font-medium">Recommended local demo</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Account A deposits 10 WETH and mints 9000 DSC.</li>
            <li>Simulate a price drop until Account A is liquidatable.</li>
            <li>Switch to Account B, which has a safe position and enough DSC.</li>
            <li>Approve DSC, then liquidate Account A with 1000 DSC.</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 space-y-4 rounded-md border bg-muted/10 p-4">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 min-w-0 break-words text-base font-semibold">
        {children}
      </div>
    </div>
  );
}

function Notice({
  children,
  destructive = false,
}: {
  children: ReactNode;
  destructive?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
        destructive
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "bg-muted/20 text-muted-foreground"
      }`}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function toHealthFactor(value?: bigint) {
  return value === undefined ? undefined : Number(formatEther(value));
}

function getTargetRisk(healthFactor?: number, debt?: bigint) {
  if (healthFactor === undefined || debt === undefined) return "Unknown";
  if (debt === BigInt(0)) return "Healthy";
  if (healthFactor < MIN_HEALTH_FACTOR) return "Liquidatable";
  if (healthFactor < 1.2) return "Risky";
  return "Healthy";
}

function formatCollateral(value: number, symbol: string) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} ${symbol}`;
}

function getActionStatus(
  liquidation: ReturnType<typeof useLiquidationDemo>["liquidation"],
  hasWallet: boolean,
): ActionStatus {
  if (!hasWallet) {
    return { label: "Liquidation unavailable", variant: "secondary" };
  }
  if (!liquidation.isTargetAddressValid) {
    return { label: "Liquidation unavailable", variant: "secondary" };
  }
  if (liquidation.isSelfLiquidation) {
    return { label: "Switch wallet required", variant: "destructive" };
  }
  if (!liquidation.isTargetLiquidatable) {
    return { label: "Not liquidatable", variant: "secondary" };
  }
  if (!liquidation.hasDebtToCover) {
    return { label: "Liquidatable", variant: "destructive" };
  }
  if (liquidation.debtExceedsTarget) {
    return { label: "Liquidation unavailable", variant: "destructive" };
  }
  if (!liquidation.hasEnoughLiquidatorDsc) {
    return { label: "Insufficient DSC", variant: "destructive" };
  }
  if (!liquidation.isLiquidatorHealthy) {
    return { label: "Unsafe liquidator", variant: "destructive" };
  }
  if (liquidation.needsDscApproval) {
    return { label: "Approval required", variant: "secondary" };
  }
  if (liquidation.canLiquidate) {
    return { label: "Ready to liquidate", variant: "default" };
  }
  return { label: "Liquidatable", variant: "destructive" };
}

function getNotice(
  liquidation: ReturnType<typeof useLiquidationDemo>["liquidation"],
  previewError: unknown,
  hasReadError: boolean,
  hasWallet: boolean,
) {
  if (!hasWallet) {
    return {
      destructive: false,
      text: "Connect a liquidator wallet to check DSC balance, allowance, and liquidation readiness.",
    };
  }
  if (!liquidation.isTargetAddressValid) {
    return {
      destructive: false,
      text: "Enter a valid EVM address to inspect the target position.",
    };
  }
  if (hasReadError) {
    return {
      destructive: true,
      text: "Unable to read liquidation data. Check the local chain and contract state, then refresh the target position.",
    };
  }
  if (liquidation.isSelfLiquidation) {
    return {
      destructive: true,
      text: "You cannot liquidate the same wallet that is currently connected. Switch to another wallet account as the liquidator.",
    };
  }
  if (
    liquidation.isTargetAddressValid &&
    liquidation.targetHealthFactor !== undefined &&
    !liquidation.isTargetLiquidatable
  ) {
    return {
      destructive: false,
      text: "Position is healthy and cannot be liquidated.",
    };
  }
  if (liquidation.debtExceedsTarget) {
    return {
      destructive: true,
      text: "Debt to cover exceeds target user's debt.",
    };
  }
  if (
    liquidation.hasDebtToCover &&
    !liquidation.hasEnoughLiquidatorDsc
  ) {
    return {
      destructive: true,
      text: "Insufficient DSC balance to cover this debt.",
    };
  }
  if (
    liquidation.liquidatorDscDebt !== undefined &&
    !liquidation.isLiquidatorHealthy
  ) {
    return {
      destructive: true,
      text: "Your own position is unsafe. Please repay DSC or add collateral before liquidating others.",
    };
  }
  if (liquidation.needsDscApproval) {
    return {
      destructive: false,
      text: "Approval required. DSCEngine must be allowed to transfer the DSC used to cover the target debt.",
    };
  }
  if (previewError && liquidation.canLiquidate) {
    return {
      destructive: true,
      text: getLiquidationErrorMessage(previewError),
    };
  }
  if (liquidation.isTargetLiquidatable) {
    return {
      destructive: false,
      text: "If liquidation fails because the health factor is not improved, increase the debt to cover.",
    };
  }
  return null;
}
