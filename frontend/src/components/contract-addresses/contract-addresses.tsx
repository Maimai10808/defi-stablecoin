"use client";

import {
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  FileCode2,
  Link2,
  Network,
  ShieldCheck,
} from "lucide-react";

import {
  CHAIN_ID,
  DSC_ENGINE_ADDRESS,
  DECENTRALIZED_STABLE_COIN_ADDRESS,
  WETH_ADDRESS,
  WBTC_ADDRESS,
  ETH_USD_PRICE_FEED_ADDRESS,
  BTC_USD_PRICE_FEED_ADDRESS,
} from "@/constants/contracts";
import {
  isAvailableAddress,
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
import { Separator } from "@/components/ui/separator";
import {
  MotionCard,
  MotionCopyButton,
  MotionErrorShake,
  MotionNumberText,
  MotionOracleBeam,
  MotionPressable,
  MotionRevealList,
} from "@/components/motion";

type ContractAddressItem = {
  label: string;
  description: string;
  value?: string | null;
  type: "core" | "token" | "price-feed";
};

const contractAddressItems: ContractAddressItem[] = [
  {
    label: "DSCEngine",
    description:
      "Core protocol contract for collateral, minting, redemption, and liquidation.",
    value: DSC_ENGINE_ADDRESS,
    type: "core",
  },
  {
    label: "DecentralizedStableCoin",
    description: "ERC20 stablecoin token minted and burned by the DSC engine.",
    value: DECENTRALIZED_STABLE_COIN_ADDRESS,
    type: "core",
  },
  {
    label: "WETH Mock",
    description: "Local mock collateral token used for the Anvil demo.",
    value: WETH_ADDRESS,
    type: "token",
  },
  {
    label: "WBTC Mock",
    description: "Local mock collateral token used for the Anvil demo.",
    value: WBTC_ADDRESS,
    type: "token",
  },
  {
    label: "ETH/USD Price Feed",
    description: "Local mock Chainlink price feed for WETH valuation.",
    value: ETH_USD_PRICE_FEED_ADDRESS,
    type: "price-feed",
  },
  {
    label: "BTC/USD Price Feed",
    description: "Local mock Chainlink price feed for WBTC valuation.",
    value: BTC_USD_PRICE_FEED_ADDRESS,
    type: "price-feed",
  },
];

function getTypeLabel(type: ContractAddressItem["type"]) {
  if (type === "core") return "Core";
  if (type === "token") return "Token";
  return "Price Feed";
}

function getAvailableCount() {
  return contractAddressItems.filter((item) => isAvailableAddress(item.value))
    .length;
}

type AddressCardProps = {
  item: ContractAddressItem;
};

function AddressCard({ item }: AddressCardProps) {
  const available = isAvailableAddress(item.value);

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{item.label}</p>

            <Badge variant="outline">{getTypeLabel(item.type)}</Badge>

            <Badge
              variant={available ? "default" : "secondary"}
              className="gap-1"
            >
              {available ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <CircleAlert className="size-3" />
              )}
              {available ? "Available" : "Missing"}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>

        <MotionCopyButton
          value={available ? item.value : undefined}
          label="Copy"
          className="shrink-0 border-transparent px-2 py-2"
        />
      </div>

      <div className="mt-4 rounded-lg border bg-background px-3 py-2">
        <p className="text-xs text-muted-foreground">Address</p>
        <p className="mt-1 break-all font-mono text-sm">
          {available ? item.value : "Not available"}
        </p>
      </div>
    </div>
  );
}

export function ContractAddresses() {
  const availableCount = getAvailableCount();
  const totalCount = contractAddressItems.length;
  const allReady = availableCount === totalCount;

  return (
    <MotionCard>
      <Card id="contract-addresses" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileCode2 className="size-5" />
              Contract Addresses
            </CardTitle>
            <CardDescription>
              Decentralized StableCoin local demo dashboard.
            </CardDescription>
          </div>

          <Badge variant={allReady ? "default" : "secondary"} className="gap-1">
            {allReady ? (
              <ShieldCheck className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {availableCount}/{totalCount} Ready
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Network className="size-4" />
              Chain
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              <MotionNumberText value={CHAIN_ID} decimals={0} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Current generated deployment chain ID.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Database className="size-4" />
              Contracts
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              <MotionNumberText value={availableCount} decimals={0} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Available addresses synced from Foundry deployment output.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Link2 className="size-4" />
              Engine
            </div>
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {shortAddress(DSC_ENGINE_ADDRESS)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Main protocol entry contract.
            </p>
          </div>
        </div>

        <MotionOracleBeam
          fromLabel="Deployment Sync"
          toLabel="Frontend Constants"
          active={allReady}
        />

        <MotionErrorShake trigger={!allReady}>
          {!allReady ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Some contract addresses are missing. Run deployment and address sync
            again before using all dashboard features.
          </div>
          ) : null}
        </MotionErrorShake>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="size-4" />
            <h3 className="text-sm font-medium">Synced Contract Addresses</h3>
          </div>

          <MotionRevealList className="grid gap-3 xl:grid-cols-2">
            {contractAddressItems.map((item) => (
              <AddressCard key={item.label} item={item} />
            ))}
          </MotionRevealList>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            These values are generated from your local deployment and written to{" "}
            <span className="font-mono text-foreground">
              src/constants/contracts.ts
            </span>
            .
          </div>

          <MotionPressable>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href="#activity-log">
                View Activity Log
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
