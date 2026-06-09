"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  CircleAlert,
  Coins,
  Database,
  ShieldAlert,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { formatEther } from "viem";

import { useMyPosition } from "@/hooks/use-my-position";
import { useSelectedLocalDemoAccount } from "@/hooks/use-local-demo-account";

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
  MotionHealthFactorText,
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

function AccountIdentity({
  label,
  address,
  description,
}: {
  label: string;
  address?: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-mono text-sm font-medium">
        {shortAddress(address)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export function MyPosition() {
  const {
    accounts,
    displayAddress,
    isLocalDemo,
    selectedAccount,
    selectedAddress,
    setSelectedAddress,
  } = useSelectedLocalDemoAccount();

  const { wallet, position, status } = useMyPosition(displayAddress);
  const isViewingConnectedWallet =
    Boolean(wallet.address) &&
    wallet.address?.toLowerCase() === selectedAccount.address.toLowerCase();
  const selectedAccountName = `${selectedAccount.label}${
    "role" in selectedAccount && selectedAccount.role
      ? ` · ${selectedAccount.role}`
      : ""
  }`;

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

      {isLocalDemo ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Local Demo Account</p>
              <p className="text-sm text-muted-foreground">
                Choose a read-only demo account position to inspect.
              </p>
            </div>
            <select
              value={selectedAddress}
              onChange={(event) =>
                setSelectedAddress(event.target.value as typeof selectedAddress)
              }
              className="h-9 min-w-[240px] rounded-md border border-input bg-card px-3 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {accounts.map((account) => (
                <option key={account.address} value={account.address}>
                  {'role' in account && account.role
                    ? `${account.label} · ${account.role} · ${shortAddress(account.address)}`
                    : `${account.label} · ${shortAddress(account.address)}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <CardContent className="space-y-6">
        {isLocalDemo ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <AccountIdentity
                label="Connected wallet"
                address={wallet.address}
                description="Signs and submits every transaction."
              />
              <AccountIdentity
                label="Viewing account"
                address={selectedAccount.address}
                description={`${selectedAccountName} · Read-only position data.`}
              />
            </div>
            {!wallet.hasWallet ? (
              <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                Connect or switch your wallet before submitting transactions.
              </div>
            ) : !isViewingConnectedWallet ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  You are viewing this demo account only. Transactions are still
                  signed by the connected wallet.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                Viewing account matches the connected wallet.
              </div>
            )}
          </div>
        ) : (
          <AccountIdentity
            label="Connected wallet"
            address={wallet.address}
            description="Current account used for reads and transactions."
          />
        )}

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
              position.totalDscMinted === BigInt(0) ? (
                "No debt"
              ) : (
                <MotionHealthFactorText value={position.healthFactor} />
              )
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
