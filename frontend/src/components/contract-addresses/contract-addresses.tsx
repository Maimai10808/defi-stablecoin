"use client";

import {
  CheckCircle2,
  CircleAlert,
  Database,
  ExternalLink,
  FileCode2,
  KeyRound,
  Link2,
  Network,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

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
  LOCAL_DEMO_ACCOUNTS,
  type LocalDemoAccount,
} from "@/constants/local-demo-accounts";
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
  descriptionKey: "engineContract" | "dscContract" | "wethContract" | "wbtcContract" | "ethFeed" | "btcFeed";
  value?: string | null;
  type: "core" | "token" | "price-feed";
};

const contractAddressItems: ContractAddressItem[] = [
  {
    label: "DSCEngine",
    descriptionKey: "engineContract",
    value: DSC_ENGINE_ADDRESS,
    type: "core",
  },
  {
    label: "DecentralizedStableCoin",
    descriptionKey: "dscContract",
    value: DECENTRALIZED_STABLE_COIN_ADDRESS,
    type: "core",
  },
  {
    label: "WETH Mock",
    descriptionKey: "wethContract",
    value: WETH_ADDRESS,
    type: "token",
  },
  {
    label: "WBTC Mock",
    descriptionKey: "wbtcContract",
    value: WBTC_ADDRESS,
    type: "token",
  },
  {
    label: "ETH/USD Price Feed",
    descriptionKey: "ethFeed",
    value: ETH_USD_PRICE_FEED_ADDRESS,
    type: "price-feed",
  },
  {
    label: "BTC/USD Price Feed",
    descriptionKey: "btcFeed",
    value: BTC_USD_PRICE_FEED_ADDRESS,
    type: "price-feed",
  },
];

function getAvailableCount() {
  return contractAddressItems.filter((item) => isAvailableAddress(item.value))
    .length;
}

type AddressCardProps = {
  item: ContractAddressItem;
};

function AddressCard({ item }: AddressCardProps) {
  const t = useTranslations("Addresses");
  const available = isAvailableAddress(item.value);
  const typeLabel =
    item.type === "core" ? t("core") : item.type === "token" ? t("token") : t("priceFeed");

  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{item.label}</p>

            <Badge variant="outline">{typeLabel}</Badge>

            <Badge
              variant={available ? "default" : "secondary"}
              className="gap-1"
            >
              {available ? (
                <CheckCircle2 className="size-3" />
              ) : (
                <CircleAlert className="size-3" />
              )}
              {available ? t("available") : t("missing")}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{t(item.descriptionKey)}</p>
        </div>

        <MotionCopyButton
          value={available ? item.value : undefined}
          label={t("copy")}
          className="shrink-0 border-transparent px-2 py-2"
        />
      </div>

      <div className="mt-4 rounded-lg border bg-background px-3 py-2">
        <p className="text-xs text-muted-foreground">{t("address")}</p>
        <p className="mt-1 break-all font-mono text-sm">
          {available ? item.value : t("notAvailable")}
        </p>
      </div>
    </div>
  );
}

function DemoAccountCard({ account }: { account: LocalDemoAccount }) {
  const t = useTranslations("Addresses");
  const role = "role" in account ? account.role : t("demoUser");

  return (
    <div className="min-w-0 rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <UserRound className="size-4 shrink-0" />
          <p className="font-medium">{account.label}</p>
          <Badge variant="outline">{role}</Badge>
        </div>
        <Badge variant="secondary">{t("localOnly")}</Badge>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-lg border bg-background px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t("address")}</p>
            <MotionCopyButton
              value={account.address}
              label={t("copyAddress")}
              className="shrink-0 border-transparent px-2 py-1 text-xs"
            />
          </div>
          <p className="mt-1 break-all font-mono text-xs">{account.address}</p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t("privateKey")}</p>
            <MotionCopyButton
              value={account.privateKey}
              label={t("copyKey")}
              className="shrink-0 border-transparent px-2 py-1 text-xs"
            />
          </div>
          <p className="mt-1 break-all font-mono text-xs">
            {account.privateKey}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ContractAddresses() {
  const t = useTranslations("Addresses");
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
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>

          <Badge variant={allReady ? "default" : "secondary"} className="gap-1">
            {allReady ? (
              <ShieldCheck className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {availableCount}/{totalCount} {t("ready")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Network className="size-4" />
              {t("chain")}
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              <MotionNumberText value={CHAIN_ID} decimals={0} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("chainDescription")}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Database className="size-4" />
              {t("contracts")}
            </div>
            <p className="text-2xl font-semibold tracking-tight">
              <MotionNumberText value={availableCount} decimals={0} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("contractsDescription")}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Link2 className="size-4" />
              {t("engine")}
            </div>
            <p className="font-mono text-2xl font-semibold tracking-tight">
              {shortAddress(DSC_ENGINE_ADDRESS)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("engineDescription")}
            </p>
          </div>
        </div>

        <MotionOracleBeam
          fromLabel={t("deploymentSync")}
          toLabel={t("frontendConstants")}
          active={allReady}
        />

        <MotionErrorShake trigger={!allReady}>
          {!allReady ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("missingWarning")}
          </div>
          ) : null}
        </MotionErrorShake>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileCode2 className="size-4" />
            <h3 className="text-sm font-medium">{t("synced")}</h3>
          </div>

          <MotionRevealList className="grid gap-3 xl:grid-cols-2">
            {contractAddressItems.map((item) => (
              <AddressCard key={item.label} item={item} />
            ))}
          </MotionRevealList>
        </div>

        <Separator />

        {CHAIN_ID === 31337 ? (
          <>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4" />
                  <h3 className="text-sm font-medium">
                    {t("accounts")}
                  </h3>
                </div>
                <Badge variant="secondary">
                  {t("accountCount", { count: LOCAL_DEMO_ACCOUNTS.length })}
                </Badge>
              </div>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                {t("credentialsWarning")}
              </div>

              <MotionRevealList className="grid gap-3 xl:grid-cols-2">
                {LOCAL_DEMO_ACCOUNTS.map((account) => (
                  <DemoAccountCard key={account.address} account={account} />
                ))}
              </MotionRevealList>
            </div>

            <Separator />
          </>
        ) : null}

        <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            {t("footer")}{" "}
            <span className="font-mono text-foreground">
              src/constants/contracts.ts
            </span>
            .
          </div>

          <MotionPressable>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href="#activity-log">
                {t("viewActivity")}
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
