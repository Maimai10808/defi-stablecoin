"use client";

import {
  AlertTriangle,
  CircleAlert,
  Coins,
  Database,
  Flame,
  Info,
  ShieldAlert,
  Target,
  Wallet,
} from "lucide-react";

import { useLiquidationDemo } from "@/hooks/use-liquidation-demo";
import {
  formatHealthFactor,
  formatTokenAmount,
  formatDscSupply,
  shortAddress,
} from "@/lib/format";

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
import { Separator } from "@/components/ui/separator";

type MetricItemProps = {
  label: string;
  value: string;
  description: string;
};

function MetricItem({ label, value, description }: MetricItemProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 break-all text-xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function LiquidationDemo() {
  const { wallet, form, updateField, liquidation, status } =
    useLiquidationDemo();

  return (
    <Card id="liquidation-demo" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Flame className="size-5" />
              Liquidation Demo
            </CardTitle>
            <CardDescription>
              Decentralized StableCoin local demo dashboard.
            </CardDescription>
          </div>

          <Badge
            variant={liquidation.canSubmit ? "default" : "secondary"}
            className="gap-1"
          >
            {liquidation.canSubmit ? (
              <ShieldAlert className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {liquidation.canSubmit ? "Ready to Liquidate" : "Not Ready"}
          </Badge>
        </div>

        {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to prepare liquidation data. The target account may be safe,
            inputs may be invalid, or the local chain may not be ready.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Liquidator Wallet</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {shortAddress(wallet.address)}
              </p>
            </div>

            <Badge variant="outline">
              {wallet.hasWallet ? "Connected" : "No Wallet"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">User To Liquidate</label>
            <Input
              placeholder="0x..."
              value={form.userToLiquidate}
              onChange={(event) =>
                updateField(
                  "userToLiquidate",
                  event.target.value as `0x${string}`,
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Enter the account address whose health factor is below 1.00.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Collateral Token</label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
            <p className="text-xs text-muted-foreground">
              Choose the collateral to seize from the unsafe account.
            </p>
          </div>

          <div className="space-y-2 lg:col-span-2">
            <label className="text-sm font-medium">Debt To Cover</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="Example: 100"
              value={form.debtToCover}
              onChange={(event) =>
                updateField("debtToCover", event.target.value)
              }
            />
            <p className="text-xs text-muted-foreground">
              Amount of DSC debt you want to repay for the target user.
            </p>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              className="w-full"
              disabled={!liquidation.canSubmit || liquidation.isSubmitting}
              onClick={liquidation.liquidate}
            >
              {liquidation.isSubmitting ? "Submitting..." : "Liquidate"}
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="size-4" />
            <h3 className="text-sm font-medium">Target Account Preview</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricItem
              label="Target Account"
              value={shortAddress(form.userToLiquidate)}
              description="The account selected for liquidation."
            />

            <MetricItem
              label="Target Health Factor"
              value={formatHealthFactor(liquidation.targetHealthFactor)}
              description="Liquidation is only valid below the safe threshold."
            />

            <MetricItem
              label={`${form.collateralSymbol} Deposited`}
              value={formatTokenAmount(
                liquidation.targetCollateralBalance,
                form.collateralSymbol,
              )}
              description="Target user's deposited collateral balance."
            />

            <MetricItem
              label="Debt To Cover"
              value={formatDscSupply(liquidation.debtToCoverInWei)}
              description="DSC amount that the liquidator will repay."
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="size-4" />
            <h3 className="text-sm font-medium">Liquidation Estimate</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <MetricItem
              label="Collateral Token"
              value={form.collateralSymbol}
              description="Collateral asset used in the liquidation call."
            />

            <MetricItem
              label="Collateral Address"
              value={shortAddress(liquidation.collateralAddress)}
              description="Token address passed into DSCEngine."
            />

            <MetricItem
              label="Base Collateral Needed"
              value={formatTokenAmount(
                liquidation.collateralNeeded,
                form.collateralSymbol,
              )}
              description="Estimated collateral equivalent before liquidation bonus."
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
            <Wallet className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Liquidator pays DSC</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The liquidator burns DSC to reduce the unsafe user&apos;s debt.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
            <Database className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Engine checks risk</p>
              <p className="mt-1 text-sm text-muted-foreground">
                DSCEngine verifies that the target health factor is unsafe.
              </p>
            </div>
          </div>

          <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Collateral is redeemed</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The liquidator receives collateral plus protocol bonus.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            This demo is designed for local Anvil testing. To make liquidation
            succeed, first create an unsafe position by minting DSC against
            collateral, then lower the mock price feed in your contract script
            or test flow.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
