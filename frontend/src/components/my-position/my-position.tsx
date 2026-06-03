"use client";

import type { ReactNode } from "react";
import {
  CircleAlert,
  Coins,
  Database,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { formatEther } from "viem";

import { useMyPosition } from "@/hooks/use-my-position";

import {
  formatHealthFactor,
  formatTokenAmount,
  shortAddress,
} from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  MotionCard,
  MotionHealthFactor,
  MotionLiquidProgress,
  MotionRevealList,
  MotionValueText,
} from "@/components/motion";

function getHealthFactorState(value?: bigint) {
  if (value === undefined) {
    return {
      label: "Loading",
      description: "Reading health factor from protocol.",
      progress: 0,
      isSafe: false,
    };
  }

  const healthFactor = Number(formatEther(value));

  if (healthFactor >= 2) {
    return {
      label: "Healthy",
      description: "Your position is safely collateralized.",
      progress: 100,
      isSafe: true,
    };
  }

  if (healthFactor >= 1.2) {
    return {
      label: "Moderate Risk",
      description:
        "Your position is above the minimum, but risk is increasing.",
      progress: 65,
      isSafe: true,
    };
  }

  if (healthFactor >= 1) {
    return {
      label: "High Risk",
      description: "Your position is close to liquidation.",
      progress: 40,
      isSafe: false,
    };
  }

  return {
    label: "Liquidatable",
    description: "Your health factor is below the safe threshold.",
    progress: 15,
    isSafe: false,
  };
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  description: string;
};

function MetricCard({ label, value, description }: MetricCardProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function MyPosition() {
  const { wallet, position, status } = useMyPosition();

  const healthFactorState = getHealthFactorState(position.healthFactor);

  return (
    <MotionCard>
      <Card id="my-position" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="size-5" />
              My Position
            </CardTitle>
            <CardDescription>
              Decentralized StableCoin local demo dashboard.
            </CardDescription>
          </div>

          <Badge
            variant={wallet.isConnected ? "default" : "secondary"}
            className="gap-1"
          >
            {wallet.isConnected ? (
              <ShieldCheck className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {wallet.isConnected ? "Wallet Connected" : "Connect Wallet"}
          </Badge>
        </div>

        {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read position data. Please check whether Anvil is running,
            contracts are deployed, and your wallet is connected to the local
            network.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Connected Account</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {shortAddress(wallet.address)}
              </p>
            </div>

            <Badge variant="outline">
              {wallet.isConnected ? "Active Position View" : "No Wallet"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Collateral Value"
            value={
              <MotionValueText
                value={position.collateralValueInUsd}
                prefix="$"
                decimals={2}
              />
            }
            description="Total deposited collateral value in USD."
          />

          <MetricCard
            label="DSC Minted"
            value={
              <MotionValueText
                value={position.totalDscMinted}
                suffix=" DSC"
                decimals={2}
              />
            }
            description="Total debt minted by this wallet."
          />

          <MetricCard
            label="Wallet DSC Balance"
            value={
              <MotionValueText
                value={position.dscWalletBalance}
                suffix=" DSC"
                decimals={2}
              />
            }
            description="DSC currently held in your wallet."
          />

          <MetricCard
            label="Health Factor"
            value={
              <MotionValueText value={position.healthFactor} decimals={2} />
            }
            description="Minimum safe value is 1.00."
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {healthFactorState.isSafe ? (
              <ShieldCheck className="size-4" />
            ) : (
              <ShieldAlert className="size-4" />
            )}
            <h3 className="text-sm font-medium">Risk Overview</h3>
          </div>

          <MotionHealthFactor
            value={
              position.healthFactor === undefined
                ? undefined
                : Number(formatEther(position.healthFactor))
            }
          >
            <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">{healthFactorState.label}</p>
                <p className="text-sm text-muted-foreground">
                  {healthFactorState.description}
                </p>
              </div>

              <Badge
                variant={healthFactorState.isSafe ? "default" : "secondary"}
              >
                HF {formatHealthFactor(position.healthFactor)}
              </Badge>
            </div>

            <Progress value={healthFactorState.progress} className="mt-4" />
            <MotionLiquidProgress
              value={healthFactorState.progress}
              label="Collateral Safety Buffer"
              className="mt-4"
            />
            </div>
          </MotionHealthFactor>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="size-4" />
            <h3 className="text-sm font-medium">Collateral Tokens</h3>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-2">
            {position.collateralPositions.map((item) => (
              <div
                key={item.symbol}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.symbol}</p>
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                  </div>

                  <Badge variant={item.isAvailable ? "outline" : "secondary"}>
                    {item.isAvailable ? "Available" : "Missing"}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Wallet Balance
                    </span>
                    <span className="font-medium">
                      {formatTokenAmount(item.walletBalance, item.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Deposited Amount
                    </span>
                    <span className="font-medium">
                      {formatTokenAmount(item.depositedAmount, item.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      Engine Allowance
                    </span>
                    <span className="font-medium">
                      {formatTokenAmount(item.allowance, item.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">Token Address</span>
                    <span className="font-mono text-xs">
                      {shortAddress(item.tokenAddress)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </MotionRevealList>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Database className="mt-0.5 size-4 shrink-0" />
          <p>
            This panel reads your wallet position directly from DSCEngine and
            token contracts, including collateral value, minted DSC, wallet
            balances, allowance, and liquidation risk.
          </p>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
