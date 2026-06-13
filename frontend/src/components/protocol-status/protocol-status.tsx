"use client";

import type * as React from "react";
import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  Link2,
  Server,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useProtocolStatus } from "@/hooks/use-protocol-status";
import { shortAddress } from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  MotionCard,
  MotionCopyButton,
  MotionErrorShake,
  MotionOracleBeam,
  MotionPressable,
  MotionSuccessBurst,
  MotionValueText,
} from "@/components/motion";

type StatusBadgeProps = {
  ready: boolean;
  readyText: string;
  pendingText: string;
};

function StatusBadge({ ready, readyText, pendingText }: StatusBadgeProps) {
  return (
    <Badge variant={ready ? "default" : "secondary"} className="gap-1">
      {ready ? (
        <CheckCircle2 className="size-3" />
      ) : (
        <CircleAlert className="size-3" />
      )}
      {ready ? readyText : pendingText}
      <MotionSuccessBurst show={ready} particleCount={8} />
    </Badge>
  );
}

type AddressRowProps = {
  label: string;
  value?: string | null;
};

function AddressRow({ label, value }: AddressRowProps) {
  const t = useTranslations("ProtocolStatus");
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm">{shortAddress(value)}</p>
      </div>

      <MotionCopyButton
        value={value}
        label={t("copy")}
        className="shrink-0 border-transparent px-2 py-2"
      />
    </div>
  );
}

type InfoItemProps = {
  label: string;
  value: React.ReactNode;
};

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 break-all text-sm font-medium">{value}</div>
    </div>
  );
}

export function ProtocolStatus() {
  const t = useTranslations("ProtocolStatus");
  const tCommon = useTranslations("Common");
  const { wallet, network, addresses, protocolData, status } =
    useProtocolStatus();

  return (
    <MotionCard>
      <Card id="protocol-status" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>

          <StatusBadge
            ready={status.demoReady}
            readyText={t("demoReady")}
            pendingText={t("setupRequired")}
          />
        </div>

        <MotionErrorShake trigger={status.hasProtocolReadError}>
          {status.hasProtocolReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("readError")}
          </div>
          ) : null}
        </MotionErrorShake>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Server className="size-4" />
              {t("network")}
            </div>

            <div className="space-y-2">
              <InfoItem
                label={t("currentChain")}
                value={network.currentChainId || t("notConnected")}
              />
              <InfoItem
                label={t("expectedChain")}
                value={network.expectedChainId}
              />
              <StatusBadge
                ready={network.isCorrectNetwork}
                readyText={t("correctNetwork")}
                pendingText={t("wrongNetwork")}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Wallet className="size-4" />
              {t("wallet")}
            </div>

            <div className="space-y-2">
              <InfoItem
                label={t("connection")}
                value={wallet.isConnected ? t("connected") : t("notConnectedWallet")}
              />
              <InfoItem label={tCommon("address")} value={shortAddress(wallet.address)} />
              <StatusBadge
                ready={wallet.isConnected}
                readyText={t("walletConnected")}
                pendingText={tCommon("connectWallet")}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Activity className="size-4" />
              {t("readiness")}
            </div>

            <div className="space-y-2">
              <StatusBadge
                ready={addresses.contractAddressesReady}
                readyText={t("addressesReady")}
                pendingText={t("missingAddresses")}
              />
              <StatusBadge
                ready={status.protocolReadable}
                readyText={t("protocolReadable")}
                pendingText={t("readingProtocol")}
              />
              <StatusBadge
                ready={status.demoReady}
                readyText={t("ready")}
                pendingText={t("notReady")}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="size-4" />
            <h3 className="text-sm font-medium">{t("contractAddresses")}</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <AddressRow label="DSCEngine" value={addresses.dscEngine} />
            <AddressRow
              label="DecentralizedStableCoin"
              value={addresses.decentralizedStableCoin}
            />
            <AddressRow label="WETH Mock" value={addresses.weth} />
            <AddressRow label="WBTC Mock" value={addresses.wbtc} />
            <AddressRow
              label="ETH/USD Price Feed"
              value={addresses.ethUsdPriceFeed}
            />
            <AddressRow
              label="BTC/USD Price Feed"
              value={addresses.btcUsdPriceFeed}
            />
          </div>

          <MotionOracleBeam
            fromLabel={t("mockFeeds")}
            toLabel="DSCEngine"
            active={addresses.contractAddressesReady}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <h3 className="text-sm font-medium">{t("protocolData")}</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              label={t("dscFromEngine")}
              value={shortAddress(protocolData.dscFromEngine.data)}
            />
            <InfoItem
              label={t("minimumHealth")}
              value={
                <MotionValueText
                  value={protocolData.minHealthFactor.data}
                  decimals={2}
                />
              }
            />
            <InfoItem
              label={t("dscName")}
              value={protocolData.dscName.data ?? tCommon("loading")}
            />
            <InfoItem
              label={t("dscSymbol")}
              value={protocolData.dscSymbol.data ?? tCommon("loading")}
            />
            <InfoItem
              label={t("totalSupply")}
              value={
                <MotionValueText
                  value={protocolData.totalSupply.data}
                  suffix=" DSC"
                  decimals={2}
                />
              }
            />
            <InfoItem
              label={t("dscOwner")}
              value={shortAddress(protocolData.dscOwner.data)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            {t("footer")}
          </div>

          <MotionPressable>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href="#contract-addresses">
                {t("viewAddresses")}
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          </MotionPressable>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
