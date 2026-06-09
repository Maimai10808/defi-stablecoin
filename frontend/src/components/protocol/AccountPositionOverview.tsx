"use client";

import type { ReactNode } from "react";
import { ShieldCheck, Users, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useBalance } from "wagmi";

import { MotionHealthFactor, MotionHealthFactorText, MotionValueText } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LocalDemoAccount } from "@/constants/local-demo-accounts";
import { useLocalDemoAccounts } from "@/hooks/use-local-demo-account";
import { useMyPosition } from "@/hooks/use-my-position";
import { formatTokenAmount, shortAddress } from "@/lib/format";

import { bigintToNumber, getRiskStatus } from "./protocol-calculations";

export function AccountPositionOverview() {
  const { accounts, isLocalDemo } = useLocalDemoAccounts();

  if (isLocalDemo) {
    return <LocalDemoAccountsOverview accounts={accounts} />;
  }

  return <ConnectedAccountOverview />;
}

function LocalDemoAccountsOverview({
  accounts,
}: {
  accounts: readonly LocalDemoAccount[];
}) {
  const { address } = useAccount();

  return (
    <Card className="w-full min-w-0">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4" />
              Local Demo Accounts Overview
            </CardTitle>
            <CardDescription>
              Read-only position summary for every configured Anvil demo account.
            </CardDescription>
          </div>
          <Badge variant="secondary">{accounts.length} demo accounts</Badge>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Connected wallet</span>
          <span className="font-mono text-xs">{shortAddress(address)}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          {accounts.map((account) => (
            <LocalDemoAccountSummary
              key={account.address}
              account={account}
              isConnected={
                address?.toLowerCase() === account.address.toLowerCase()
              }
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LocalDemoAccountSummary({
  account,
  isConnected,
}: {
  account: LocalDemoAccount;
  isConnected: boolean;
}) {
  const { position, status } = useMyPosition(account.address);
  const nativeBalance = useBalance({
    address: account.address,
    query: {
      enabled: true,
    },
  });
  const weth = position.collateralPositions.find(
    (item) => item.symbol === "WETH"
  );
  const wbtc = position.collateralPositions.find(
    (item) => item.symbol === "WBTC"
  );
  const riskStatus =
    position.totalDscMinted === BigInt(0)
      ? "Safe"
      : getRiskStatus(position.healthFactor);

  return (
    <article className="min-w-0 space-y-3 rounded-md border bg-muted/10 p-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{account.label}</p>
            {"role" in account && account.role ? (
              <Badge variant="outline">{account.role}</Badge>
            ) : null}
            {isConnected ? <Badge>Connected wallet</Badge> : null}
          </div>
          <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
            {shortAddress(account.address)}
          </p>
        </div>
        <Badge variant={riskStatus === "Safe" ? "default" : "secondary"}>
          {riskStatus}
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <CompactMetric label="Native balance">
          {nativeBalance.data
            ? `${Number(formatEther(nativeBalance.data.value)).toLocaleString(
                undefined,
                { maximumFractionDigits: 3 }
              )} ${nativeBalance.data.symbol}`
            : "Loading..."}
        </CompactMetric>
        <CompactMetric label="Collateral value">
          <MotionValueText
            value={position.collateralValueInUsd}
            prefix="$"
            decimals={2}
          />
        </CompactMetric>
        <CompactMetric label="DSC debt">
          <MotionValueText
            value={position.totalDscMinted}
            suffix=" DSC"
            decimals={2}
          />
        </CompactMetric>
        <CompactMetric label="Wallet DSC">
          <MotionValueText
            value={position.dscWalletBalance}
            suffix=" DSC"
            decimals={2}
          />
        </CompactMetric>
        <CompactMetric label="Health Factor">
          {position.totalDscMinted === BigInt(0) ? (
            "No debt"
          ) : (
            <MotionHealthFactor value={bigintToNumber(position.healthFactor)}>
              <MotionHealthFactorText value={position.healthFactor} />
            </MotionHealthFactor>
          )}
        </CompactMetric>
        <CompactMetric label="Deposited collateral">
          <span className="block">
            {formatTokenAmount(weth?.depositedAmount, "WETH")}
          </span>
          <span className="block">
            {formatTokenAmount(wbtc?.depositedAmount, "WBTC")}
          </span>
        </CompactMetric>
      </div>

      {status.hasReadError || nativeBalance.isError ? (
        <p className="flex items-start gap-2 text-xs text-destructive">
          <ShieldCheck className="mt-0.5 size-3 shrink-0" />
          Some account data is unavailable. Check the local Anvil chain.
        </p>
      ) : null}
    </article>
  );
}

function ConnectedAccountOverview() {
  const { wallet, position, status } = useMyPosition();
  const riskStatus =
    position.totalDscMinted === BigInt(0)
      ? "Safe"
      : getRiskStatus(position.healthFactor);

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
          <span className="font-mono text-xs">
            {shortAddress(wallet.address)}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Collateral value">
            <MotionValueText
              value={position.collateralValueInUsd}
              prefix="$"
              decimals={2}
            />
          </Metric>
          <Metric label="DSC minted">
            <MotionValueText
              value={position.totalDscMinted}
              suffix=" DSC"
              decimals={2}
            />
          </Metric>
          <Metric label="Wallet DSC">
            <MotionValueText
              value={position.dscWalletBalance}
              suffix=" DSC"
              decimals={2}
            />
          </Metric>
          <Metric label="Health Factor">
            {position.totalDscMinted === BigInt(0) ? (
              "No debt"
            ) : (
              <MotionHealthFactor value={bigintToNumber(position.healthFactor)}>
                <MotionHealthFactorText value={position.healthFactor} />
              </MotionHealthFactor>
            )}
          </Metric>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {position.collateralPositions.map((token) => (
            <div
              key={token.symbol}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">
                {token.symbol} deposited
              </span>
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
              ? "Position data is unavailable. Check the chain and contract deployment."
              : "Connect a wallet to read your protocol position."}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 truncate text-lg font-semibold">{children}</div>
    </div>
  );
}

function CompactMetric({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-md border bg-background p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 min-w-0 break-words text-sm font-semibold">
        {children}
      </div>
    </div>
  );
}
