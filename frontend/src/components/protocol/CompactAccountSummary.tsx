"use client";

import type { ReactNode } from "react";
import { Gauge, WalletCards } from "lucide-react";

import {
  MotionHealthFactorText,
  MotionValueText,
} from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMyPosition } from "@/hooks/use-my-position";
import { formatTokenAmount, shortAddress } from "@/lib/format";

import { getRiskStatus } from "./protocol-calculations";

export function CompactAccountSummary() {
  const { wallet, position, status } = useMyPosition();
  const weth = position.collateralPositions.find(
    (token) => token.symbol === "WETH",
  );
  const wbtc = position.collateralPositions.find(
    (token) => token.symbol === "WBTC",
  );
  const hasNoDebt = position.totalDscMinted === BigInt(0);
  const riskStatus = hasNoDebt ? "Safe" : getRiskStatus(position.healthFactor);

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="gap-3 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <WalletCards className="size-4" />
              Current Account Snapshot
            </CardTitle>
            <CardDescription>
              Essential position data for the wallet operating this protocol
              flow.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono">
              {shortAddress(wallet.address)}
            </Badge>
            <Badge variant={riskStatus === "Safe" ? "default" : "secondary"}>
              {riskStatus}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!wallet.hasWallet ? (
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            Connect a wallet to view the current account snapshot.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Metric label="Collateral value">
              <MotionValueText
                value={position.collateralValueInUsd}
                prefix="$"
                decimals={2}
              />
            </Metric>
            <Metric label="DSC debt">
              <MotionValueText
                value={position.totalDscMinted}
                suffix=" DSC"
                decimals={2}
              />
            </Metric>
            <Metric label="Health Factor">
              {hasNoDebt ? (
                <span title="No DSC debt">∞</span>
              ) : (
                <MotionHealthFactorText value={position.healthFactor} />
              )}
            </Metric>
            <Metric label="Wallet DSC">
              <MotionValueText
                value={position.dscWalletBalance}
                suffix=" DSC"
                decimals={2}
              />
            </Metric>
            <Metric label="WETH deposited">
              {formatTokenAmount(weth?.depositedAmount, "WETH")}
            </Metric>
            <Metric label="WBTC deposited">
              {formatTokenAmount(wbtc?.depositedAmount, "WBTC")}
            </Metric>
          </div>
        )}

        {status.hasReadError ? (
          <p className="mt-3 flex items-center gap-2 text-xs text-destructive">
            <Gauge className="size-3.5" />
            Some account data could not be refreshed from DSCEngine.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 truncate text-sm font-semibold">{children}</div>
    </div>
  );
}
