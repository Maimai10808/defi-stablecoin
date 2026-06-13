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
import { useTranslations } from "next-intl";

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
  label:
    | "statusUnavailable"
    | "statusSwitchWallet"
    | "notLiquidatable"
    | "liquidatable"
    | "statusInsufficient"
    | "statusUnsafe"
    | "statusApproval"
    | "statusReady";
  variant: "default" | "secondary" | "destructive" | "outline";
};

export function LiquidationPanel() {
  const t = useTranslations("Liquidation");
  const tCommon = useTranslations("Common");
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
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={
                liquidation.isTargetLiquidatable ? "destructive" : "secondary"
              }
            >
              {t("target")}:{" "}
              {liquidation.isTargetLiquidatable
                ? t("liquidatable")
                : t("notLiquidatable")}
            </Badge>
            <Badge variant={actionStatus.variant}>{t(actionStatus.label)}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <Section title={t("targetAccount")} icon={<ShieldAlert className="size-4" />}>
          <div className="space-y-2">
            <Label htmlFor="liquidation-target">{t("userToLiquidate")}</Label>
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
            <Metric label={t("targetHealth")}>
              <MotionHealthFactorText value={liquidation.targetHealthFactor} />
            </Metric>
            <Metric label={t("targetDebt")}>
              <MotionValueText
                value={liquidation.targetDscDebt}
                suffix=" DSC"
                decimals={2}
              />
            </Metric>
            <Metric label={t("deposited", { token: form.collateralSymbol })}>
              {formatTokenAmount(
                liquidation.targetCollateralBalance,
                form.collateralSymbol,
              )}
            </Metric>
            <Metric label={t("riskStatus")}>
              <Badge
                variant={
                  targetRisk === "Liquidatable" ? "destructive" : "secondary"
                }
              >
                {tCommon(targetRisk.toLowerCase() as "unknown" | "healthy" | "risky" | "liquidatable")}
              </Badge>
            </Metric>
          </div>
        </Section>

        <Section title={t("liquidator")} icon={<WalletCards className="size-4" />}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={t("connectedWallet")}>
              <span className="font-mono text-sm">
                {shortAddress(wallet.address)}
              </span>
            </Metric>
            <Metric label={t("liquidatorDsc")}>
              {liquidatorBalance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              DSC
            </Metric>
            <Metric label={t("liquidatorHealth")}>
              {liquidation.liquidatorDscDebt === BigInt(0)
                ? tCommon("noDebt")
                : liquidatorHealthFactor?.toFixed(2) ?? tCommon("loading")}
            </Metric>
            <Metric label={t("allowance")}>
              {allowance.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              DSC
            </Metric>
          </div>
        </Section>

        <Section
          title={t("estimate")}
          icon={<AlertTriangle className="size-4" />}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="liquidation-token">
                {t("collateralToken")}
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
              <Label htmlFor="liquidation-debt">{t("debtToCover")}</Label>
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
            <Metric label={t("debtToCover")}>
              {debtToCover.toLocaleString(undefined, {
                maximumFractionDigits: 2,
              })}{" "}
              DSC
            </Metric>
            <Metric label={t("withoutBonus")}>
              {formatCollateral(baseCollateral, form.collateralSymbol)}
            </Metric>
            <Metric label={t("bonus")}>
              {formatCollateral(bonusCollateral, form.collateralSymbol)} (10%)
            </Metric>
            <Metric label={t("total")}>
              {formatCollateral(totalCollateral, form.collateralSymbol)}
            </Metric>
          </div>

          <Notice>
            {t("estimateExplanation", {
              debt: debtToCover.toLocaleString(undefined, { maximumFractionDigits: 2 }),
              collateral: formatCollateral(totalCollateral, form.collateralSymbol),
            })}
          </Notice>
        </Section>

        {notice ? (
          <Notice destructive={notice.destructive}>
            {"isError" in notice && notice.isError ? notice.text : t(notice.text)}
          </Notice>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => updateField("debtToCover", "1000")}
          >
            {t("useDemoAmount")}
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
            {t("refresh")}
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
                {liquidation.isApproving ? t("approving") : t("approve")}
              </Button>
            </MotionPressable>
          ) : !liquidation.needsDscApproval &&
            liquidation.hasDebtToCover &&
            liquidation.liquidatorDscAllowance !== undefined ? (
            <Button type="button" variant="outline" disabled>
              <CheckCircle2 className="size-4" />
              {t("approved")}
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
              {t("submit")}
            </Button>
          </MotionPressable>
        </div>

        <div className="rounded-md border bg-muted/20 p-4 text-sm">
          <p className="font-medium">{t("recommended")}</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>{t("step1")}</li>
            <li>{t("step2")}</li>
            <li>{t("step3")}</li>
            <li>{t("step4")}</li>
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
    return { label: "statusUnavailable", variant: "secondary" };
  }
  if (!liquidation.isTargetAddressValid) {
    return { label: "statusUnavailable", variant: "secondary" };
  }
  if (liquidation.isSelfLiquidation) {
    return { label: "statusSwitchWallet", variant: "destructive" };
  }
  if (!liquidation.isTargetLiquidatable) {
    return { label: "notLiquidatable", variant: "secondary" };
  }
  if (!liquidation.hasDebtToCover) {
    return { label: "liquidatable", variant: "destructive" };
  }
  if (liquidation.debtExceedsTarget) {
    return { label: "statusUnavailable", variant: "destructive" };
  }
  if (!liquidation.hasEnoughLiquidatorDsc) {
    return { label: "statusInsufficient", variant: "destructive" };
  }
  if (!liquidation.isLiquidatorHealthy) {
    return { label: "statusUnsafe", variant: "destructive" };
  }
  if (liquidation.needsDscApproval) {
    return { label: "statusApproval", variant: "secondary" };
  }
  if (liquidation.canLiquidate) {
    return { label: "statusReady", variant: "default" };
  }
  return { label: "liquidatable", variant: "destructive" };
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
      text: "noticeConnect" as const,
    };
  }
  if (!liquidation.isTargetAddressValid) {
    return {
      destructive: false,
      text: "noticeAddress" as const,
    };
  }
  if (hasReadError) {
    return {
      destructive: true,
      text: "noticeRead" as const,
    };
  }
  if (liquidation.isSelfLiquidation) {
    return {
      destructive: true,
      text: "noticeSelf" as const,
    };
  }
  if (
    liquidation.isTargetAddressValid &&
    liquidation.targetHealthFactor !== undefined &&
    !liquidation.isTargetLiquidatable
  ) {
    return {
      destructive: false,
      text: "noticeHealthy" as const,
    };
  }
  if (liquidation.debtExceedsTarget) {
    return {
      destructive: true,
      text: "noticeDebt" as const,
    };
  }
  if (
    liquidation.hasDebtToCover &&
    !liquidation.hasEnoughLiquidatorDsc
  ) {
    return {
      destructive: true,
      text: "noticeBalance" as const,
    };
  }
  if (
    liquidation.liquidatorDscDebt !== undefined &&
    !liquidation.isLiquidatorHealthy
  ) {
    return {
      destructive: true,
      text: "noticeUnsafe" as const,
    };
  }
  if (liquidation.needsDscApproval) {
    return {
      destructive: false,
      text: "noticeApproval" as const,
    };
  }
  if (previewError && liquidation.canLiquidate) {
    return {
      destructive: true,
      text: getLiquidationErrorMessage(previewError),
      isError: true as const,
    };
  }
  if (liquidation.isTargetLiquidatable) {
    return {
      destructive: false,
      text: "noticeImprove" as const,
    };
  }
  return null;
}
