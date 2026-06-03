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
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/20 px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-mono text-sm">{shortAddress(value)}</p>
      </div>

      <MotionCopyButton
        value={value}
        label="Copy"
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
              Protocol Status
            </CardTitle>
            <CardDescription>
              Decentralized StableCoin local demo dashboard.
            </CardDescription>
          </div>

          <StatusBadge
            ready={status.demoReady}
            readyText="Demo Ready"
            pendingText="Setup Required"
          />
        </div>

        <MotionErrorShake trigger={status.hasProtocolReadError}>
          {status.hasProtocolReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read some protocol data. Please check whether Anvil is
            running, contracts are deployed, and wallet is connected to the
            correct local network.
          </div>
          ) : null}
        </MotionErrorShake>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Server className="size-4" />
              Network
            </div>

            <div className="space-y-2">
              <InfoItem
                label="Current Chain ID"
                value={network.currentChainId || "Not connected"}
              />
              <InfoItem
                label="Expected Chain ID"
                value={network.expectedChainId}
              />
              <StatusBadge
                ready={network.isCorrectNetwork}
                readyText="Correct Network"
                pendingText="Wrong Network"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Wallet className="size-4" />
              Wallet
            </div>

            <div className="space-y-2">
              <InfoItem
                label="Connection"
                value={wallet.isConnected ? "Connected" : "Not Connected"}
              />
              <InfoItem label="Address" value={shortAddress(wallet.address)} />
              <StatusBadge
                ready={wallet.isConnected}
                readyText="Wallet Connected"
                pendingText="Connect Wallet"
              />
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Activity className="size-4" />
              Readiness
            </div>

            <div className="space-y-2">
              <StatusBadge
                ready={addresses.contractAddressesReady}
                readyText="Addresses Ready"
                pendingText="Missing Addresses"
              />
              <StatusBadge
                ready={status.protocolReadable}
                readyText="Protocol Readable"
                pendingText="Reading Protocol"
              />
              <StatusBadge
                ready={status.demoReady}
                readyText="Ready"
                pendingText="Not Ready"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Link2 className="size-4" />
            <h3 className="text-sm font-medium">Contract Addresses</h3>
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
            fromLabel="Mock Price Feeds"
            toLabel="DSCEngine"
            active={addresses.contractAddressesReady}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <h3 className="text-sm font-medium">Protocol Data</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              label="DSC Address From Engine"
              value={shortAddress(protocolData.dscFromEngine.data)}
            />
            <InfoItem
              label="Minimum Health Factor"
              value={
                <MotionValueText
                  value={protocolData.minHealthFactor.data}
                  decimals={2}
                />
              }
            />
            <InfoItem
              label="DSC Name"
              value={protocolData.dscName.data ?? "Loading..."}
            />
            <InfoItem
              label="DSC Symbol"
              value={protocolData.dscSymbol.data ?? "Loading..."}
            />
            <InfoItem
              label="DSC Total Supply"
              value={
                <MotionValueText
                  value={protocolData.totalSupply.data}
                  suffix=" DSC"
                  decimals={2}
                />
              }
            />
            <InfoItem
              label="DSC Owner"
              value={shortAddress(protocolData.dscOwner.data)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            This panel verifies whether the local DSC protocol demo is ready to
            use.
          </div>

          <MotionPressable>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href="#contract-addresses">
                View Addresses
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
