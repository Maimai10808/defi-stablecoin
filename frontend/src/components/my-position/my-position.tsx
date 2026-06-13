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
import { useTranslations } from "next-intl";

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
      label: "loading",
      description: "loadingDescription",
      progress: 0,
      isSafe: false,
    };
  }

  const healthFactor = Number(formatEther(value));

  if (healthFactor >= 2) {
    return {
      label: "healthy",
      description: "healthyDescription",
      progress: 100,
      isSafe: true,
    };
  }

  if (healthFactor >= 1.2) {
    return {
      label: "moderate",
      description: "moderateDescription",
      progress: 65,
      isSafe: true,
    };
  }

  if (healthFactor >= 1) {
    return {
      label: "high",
      description: "highDescription",
      progress: 40,
      isSafe: false,
    };
  }

  return {
    label: "liquidatable",
    description: "liquidatableDescription",
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
  const t = useTranslations("MyPosition");
  const tCommon = useTranslations("Common");
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
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
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
            {wallet.isConnected ? tCommon("walletConnected") : tCommon("connectWallet")}
          </Badge>
        </div>

        {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("readError")}
          </div>
        ) : null}
      </CardHeader>

      {isLocalDemo ? (
        <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{t("localAccount")}</p>
              <p className="text-sm text-muted-foreground">
                {t("localAccountDescription")}
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
                label={t("connectedWallet")}
                address={wallet.address}
                description={t("signsTransactions")}
              />
              <AccountIdentity
                label={t("viewingAccount")}
                address={selectedAccount.address}
                description={t("readOnlyPosition", { account: selectedAccountName })}
              />
            </div>
            {!wallet.hasWallet ? (
              <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                <CircleAlert className="mt-0.5 size-4 shrink-0" />
                {t("connectBeforeTransactions")}
              </div>
            ) : !isViewingConnectedWallet ? (
              <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p>
                  {t("viewOnlyWarning")}
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                {t("viewMatches")}
              </div>
            )}
          </div>
        ) : (
          <AccountIdentity
            label={t("connectedWallet")}
            address={wallet.address}
            description={t("currentAccount")}
          />
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label={t("collateralValue")}
            value={
              <MotionValueText
                value={position.collateralValueInUsd}
                prefix="$"
                decimals={2}
              />
            }
            description={t("collateralValueDescription")}
          />

          <MetricCard
            label={t("dscMinted")}
            value={
              <MotionValueText
                value={position.totalDscMinted}
                suffix=" DSC"
                decimals={2}
              />
            }
            description={t("dscMintedDescription")}
          />

          <MetricCard
            label={t("walletDsc")}
            value={
              <MotionValueText
                value={position.dscWalletBalance}
                suffix=" DSC"
                decimals={2}
              />
            }
            description={t("walletDscDescription")}
          />

          <MetricCard
            label={t("healthFactor")}
            value={
              position.totalDscMinted === BigInt(0) ? (
                tCommon("noDebt")
              ) : (
                <MotionHealthFactorText value={position.healthFactor} />
              )
            }
            description={t("healthDescription")}
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
            <h3 className="text-sm font-medium">{t("riskOverview")}</h3>
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
                <p className="text-sm font-medium">{t(`states.${healthFactorState.label}`)}</p>
                <p className="text-sm text-muted-foreground">
                  {t(`states.${healthFactorState.description}`)}
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
              label={t("safetyBuffer")}
              className="mt-4"
            />
            </div>
          </MotionHealthFactor>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="size-4" />
            <h3 className="text-sm font-medium">{t("collateralTokens")}</h3>
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
                    {item.isAvailable ? tCommon("available") : tCommon("missing")}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {t("walletBalance")}
                    </span>
                    <span className="font-medium">
                      {formatTokenAmount(item.walletBalance, item.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {t("depositedAmount")}
                    </span>
                    <span className="font-medium">
                      {formatTokenAmount(item.depositedAmount, item.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {t("engineAllowance")}
                    </span>
                    <span className="font-medium">
                      {formatTokenAmount(item.allowance, item.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{t("tokenAddress")}</span>
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
            {t("footer")}
          </p>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
