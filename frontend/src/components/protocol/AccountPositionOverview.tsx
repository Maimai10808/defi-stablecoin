"use client";

import { ShieldCheck, Wallet } from "lucide-react";

import { MotionHealthFactor, MotionValueText } from "@/components/motion";
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

import { bigintToNumber, getRiskStatus } from "./protocol-calculations";

export function AccountPositionOverview() {
  const { wallet, position, status } = useMyPosition();
  const riskStatus = getRiskStatus(position.healthFactor);

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-4" />
              Account Position
            </CardTitle>
            <CardDescription>
              Current collateral, debt, and liquidation safety.
            </CardDescription>
          </div>
          <Badge variant={riskStatus === "Safe" ? "default" : "secondary"}>
            {riskStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2">
          <span className="text-xs text-muted-foreground">Connected wallet</span>
          <span className="font-mono text-xs">{shortAddress(wallet.address)}</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Collateral value">
            <MotionValueText value={position.collateralValueInUsd} prefix="$" decimals={2} />
          </Metric>
          <Metric label="DSC minted">
            <MotionValueText value={position.totalDscMinted} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label="Wallet DSC">
            <MotionValueText value={position.dscWalletBalance} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label="Health Factor">
            <MotionHealthFactor value={bigintToNumber(position.healthFactor)}>
              <MotionValueText value={position.healthFactor} decimals={2} />
            </MotionHealthFactor>
          </Metric>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {position.collateralPositions.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
              <span className="text-muted-foreground">{token.symbol} deposited</span>
              <span className="font-medium">
                {formatTokenAmount(token.depositedAmount, token.symbol)}
              </span>
            </div>
          ))}
        </div>

        {!wallet.hasWallet || status.hasReadError ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            {wallet.hasWallet
              ? "Position data is unavailable. Check the local chain and contract deployment."
              : "Connect a wallet to read your protocol position."}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 truncate text-lg font-semibold">{children}</div>
    </div>
  );
}
