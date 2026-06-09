"use client";

import { CircleAlert, Loader2, Undo2 } from "lucide-react";

import { MotionHealthFactorText, MotionNumberText, MotionPressable } from "@/components/motion";
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
import { formatTokenAmount } from "@/lib/format";

import {
  bigintToNumber,
  estimateHealthFactor,
  formatEstimatedHealthFactor,
  MIN_HEALTH_FACTOR,
  parsePositiveAmount,
} from "./protocol-calculations";

export function RedeemCollateralPanel() {
  const { form, tokens, selectedToken, position: repayPosition, status, actions } = useRepayRedeem();
  const { wallet, position } = useMyPosition();
  const amount = parsePositiveAmount(form.collateralAmount);
  const depositedAmount = bigintToNumber(selectedToken?.depositedAmount);
  const currentCollateralUsd = bigintToNumber(position.collateralValueInUsd);
  const currentDebt = bigintToNumber(position.totalDscMinted);
  const estimatedUsdValue = bigintToNumber(repayPosition.selectedCollateralUsdValue);
  const collateralAfter = Math.max(currentCollateralUsd - estimatedUsdValue, 0);
  const healthFactorAfter = estimateHealthFactor(collateralAfter, currentDebt);
  const noCollateral = depositedAmount <= 0;
  const exceedsDeposit = amount > depositedAmount;
  const unsafeRedeem = currentDebt > 0 && healthFactorAfter < MIN_HEALTH_FACTOR;
  const canRedeem =
    wallet.hasWallet &&
    amount > 0 &&
    !noCollateral &&
    !exceedsDeposit &&
    !unsafeRedeem &&
    !status.isRedeeming;

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Undo2 className="size-4" />
              Redeem Collateral
            </CardTitle>
            <CardDescription>
              Withdraw deposited collateral without repaying DSC in the same action.
            </CardDescription>
          </div>
          <Badge variant="outline">Step 4</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {tokens.map((token) => (
            <Button
              key={token.symbol}
              type="button"
              variant={form.collateralToken === token.symbol ? "default" : "outline"}
              disabled={!wallet.hasWallet || !token.isAvailable}
              onClick={() => actions.updateField("collateralToken", token.symbol)}
            >
              {token.symbol}
              <span className="ml-auto text-xs opacity-70">
                {formatTokenAmount(token.depositedAmount)}
              </span>
            </Button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Deposited amount" value={formatTokenAmount(selectedToken?.depositedAmount, form.collateralToken)} />
          <Metric label="Estimated USD to redeem"><MotionNumberText value={estimatedUsdValue} prefix="$" decimals={2} /></Metric>
          <Metric label="Health Factor before"><MotionHealthFactorText value={position.healthFactor} /></Metric>
        </div>

        <div className="space-y-2">
          <Label htmlFor="redeem-collateral-amount">Collateral amount to redeem</Label>
          <Input
            id="redeem-collateral-amount"
            value={form.collateralAmount}
            inputMode="decimal"
            placeholder="0.5"
            disabled={!wallet.hasWallet || noCollateral}
            onChange={(event) => actions.updateField("collateralAmount", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Estimated Health Factor after redeem:{" "}
            <span className="font-medium text-foreground">{formatEstimatedHealthFactor(healthFactorAfter)}</span>
          </p>
        </div>

        {noCollateral ? (
          <Notice>No deposited collateral for {form.collateralToken}.</Notice>
        ) : exceedsDeposit ? (
          <Notice destructive>Amount exceeds deposited collateral.</Notice>
        ) : unsafeRedeem ? (
          <Notice destructive>Redeeming this amount would make your position unsafe.</Notice>
        ) : currentDebt > 0 ? (
          <Notice>Redeeming collateral reduces your safety margin while DSC debt remains.</Notice>
        ) : null}

        <MotionPressable disabled={!canRedeem}>
          <Button type="button" disabled={!canRedeem} onClick={actions.redeemSelectedCollateral}>
            {status.isRedeeming ? <Loader2 className="size-4 animate-spin" /> : null}
            Redeem Collateral
          </Button>
        </MotionPressable>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return <div className="rounded-md border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-base font-semibold">{children ?? value}</div></div>;
}

function Notice({ children, destructive = false }: { children: React.ReactNode; destructive?: boolean }) {
  return <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${destructive ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}><CircleAlert className="mt-0.5 size-4 shrink-0" />{children}</div>;
}
