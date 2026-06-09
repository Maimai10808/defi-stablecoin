"use client";

import { CircleAlert, Flame, Loader2, LockKeyhole } from "lucide-react";

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
import { useMyPosition } from "@/hooks/use-my-position";
import { useRepayRedeem } from "@/hooks/use-repay-redeem";

import {
  bigintToNumber,
  estimateHealthFactor,
  formatEstimatedHealthFactor,
  parsePositiveAmount,
} from "./protocol-calculations";

export function RepayDscPanel() {
  const { form, position: repayPosition, status, actions } = useRepayRedeem();
  const { wallet, position } = useMyPosition();
  const repayAmount = parsePositiveAmount(form.dscAmountToBurn);
  const currentDebt = bigintToNumber(position.totalDscMinted);
  const dscBalance = bigintToNumber(position.dscWalletBalance);
  const collateralUsd = bigintToNumber(position.collateralValueInUsd);
  const debtAfter = Math.max(currentDebt - repayAmount, 0);
  const healthFactorAfter = estimateHealthFactor(collateralUsd, debtAfter);
  const exceedsBalance = repayAmount > dscBalance;
  const exceedsDebt = repayAmount > currentDebt;
  const noDebt = currentDebt <= 0;
  const canRepay =
    wallet.hasWallet &&
    repayAmount > 0 &&
    !noDebt &&
    !exceedsBalance &&
    !exceedsDebt &&
    !status.needsApproval &&
    !status.isRepaying &&
    !status.isApproving;

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-4" />
              Repay DSC
            </CardTitle>
            <CardDescription>
              Burn wallet DSC to reduce debt and improve your Health Factor.
            </CardDescription>
          </div>
          <Badge variant="outline">Step 4</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Current DSC debt">
            <MotionValueText value={position.totalDscMinted} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label="Wallet DSC balance">
            <MotionValueText value={position.dscWalletBalance} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label="Health Factor before">
            <MotionHealthFactorText value={position.healthFactor} />
          </Metric>
        </div>

        <div className="space-y-2">
          <Label htmlFor="repay-dsc-amount">DSC amount to repay</Label>
          <Input
            id="repay-dsc-amount"
            value={form.dscAmountToBurn}
            inputMode="decimal"
            placeholder="250"
            disabled={!wallet.hasWallet || noDebt}
            onChange={(event) => actions.updateField("dscAmountToBurn", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Estimated Health Factor after repay:{" "}
            <span className="font-medium text-foreground">
              {formatEstimatedHealthFactor(healthFactorAfter)}
            </span>
          </p>
        </div>

        {noDebt ? (
          <Notice>No DSC debt to repay.</Notice>
        ) : exceedsBalance ? (
          <Notice destructive>Insufficient DSC balance.</Notice>
        ) : exceedsDebt ? (
          <Notice destructive>Amount exceeds current debt.</Notice>
        ) : status.needsApproval ? (
          <Notice>Approve DSC before the engine can burn it.</Notice>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <MotionPressable disabled={!status.needsApproval || status.isApproving}>
            <Button
              type="button"
              variant="outline"
              disabled={!wallet.hasWallet || !status.needsApproval || status.isApproving}
              onClick={actions.approveDscForEngine}
            >
              {status.isApproving ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />}
              Approve DSC
            </Button>
          </MotionPressable>
          <MotionPressable disabled={!canRepay}>
            <Button type="button" disabled={!canRepay} onClick={actions.repayDsc}>
              {status.isRepaying ? <Loader2 className="size-4 animate-spin" /> : null}
              Repay DSC
            </Button>
          </MotionPressable>
        </div>

        <p className="text-xs text-muted-foreground">
          Current engine allowance: {bigintToNumber(repayPosition.dscEngineAllowance).toLocaleString()} DSC
        </p>
      </CardContent>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-md border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-base font-semibold">{children}</div></div>;
}

function Notice({ children, destructive = false }: { children: React.ReactNode; destructive?: boolean }) {
  return <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${destructive ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}><CircleAlert className="mt-0.5 size-4 shrink-0" />{children}</div>;
}
