"use client";

import { AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { formatEther } from "viem";

import { MotionPressable, MotionValueText } from "@/components/motion";
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
import { formatTokenAmount } from "@/lib/format";

import {
  bigintToNumber,
  LIQUIDATION_BONUS,
  MIN_HEALTH_FACTOR,
} from "./protocol-calculations";

export function LiquidationPanel() {
  const { form, updateField, liquidation, status } = useLiquidationDemo();
  const targetHealthFactor =
    liquidation.targetHealthFactor === undefined
      ? undefined
      : Number(formatEther(liquidation.targetHealthFactor));
  const isLiquidatable =
    targetHealthFactor !== undefined && targetHealthFactor < MIN_HEALTH_FACTOR;
  const liquidatorBalance = bigintToNumber(liquidation.liquidatorDscBalance);
  const debtToCover = bigintToNumber(liquidation.debtToCoverInWei);
  const insufficientDsc = debtToCover > liquidatorBalance;
  const baseCollateral = bigintToNumber(liquidation.collateralNeeded);
  const estimatedCollateral = baseCollateral * (1 + LIQUIDATION_BONUS);
  const canLiquidate =
    liquidation.canSubmit && isLiquidatable && !insufficientDsc && !liquidation.isSubmitting;

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-4" />
              Liquidation
            </CardTitle>
            <CardDescription>
              Cover DSC debt for a position below Health Factor 1.00 and receive collateral plus bonus.
            </CardDescription>
          </div>
          <Badge variant={isLiquidatable ? "destructive" : "secondary"}>
            {isLiquidatable ? "Liquidatable" : "Not liquidatable"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="liquidation-target">User to liquidate</Label>
          <Input
            id="liquidation-target"
            value={form.userToLiquidate}
            placeholder="0x..."
            onChange={(event) => updateField("userToLiquidate", event.target.value as `0x${string}`)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="liquidation-token">Collateral token</Label>
            <select
              id="liquidation-token"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              value={form.collateralSymbol}
              onChange={(event) => updateField("collateralSymbol", event.target.value as "WETH" | "WBTC")}
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
              placeholder="100"
              onChange={(event) => updateField("debtToCover", event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Target Health Factor">
            <MotionValueText value={liquidation.targetHealthFactor} decimals={2} />
          </Metric>
          <Metric label="Liquidator DSC">
            <MotionValueText value={liquidation.liquidatorDscBalance} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label="Estimated collateral">
            {estimatedCollateral.toLocaleString(undefined, { maximumFractionDigits: 4 })} {form.collateralSymbol}
          </Metric>
          <Metric label="Liquidation bonus">10%</Metric>
        </div>

        {targetHealthFactor !== undefined && !isLiquidatable ? (
          <Notice>Position is healthy and cannot be liquidated.</Notice>
        ) : insufficientDsc ? (
          <Notice destructive>Insufficient DSC to cover debt.</Notice>
        ) : status.hasReadError ? (
          <Notice destructive>Unable to prepare liquidation. Check the target address and protocol state.</Notice>
        ) : (
          <Notice>
            The liquidator repays target debt and receives approximately {formatTokenAmount(liquidation.collateralNeeded, form.collateralSymbol)} plus a 10% bonus.
          </Notice>
        )}

        <MotionPressable disabled={!canLiquidate}>
          <Button type="button" disabled={!canLiquidate} onClick={liquidation.liquidate}>
            {liquidation.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            Liquidate Position
          </Button>
        </MotionPressable>
      </CardContent>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="rounded-md border bg-muted/20 p-3"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 text-base font-semibold">{children}</div></div>;
}

function Notice({ children, destructive = false }: { children: React.ReactNode; destructive?: boolean }) {
  return <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${destructive ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}><AlertTriangle className="mt-0.5 size-4 shrink-0" />{children}</div>;
}
