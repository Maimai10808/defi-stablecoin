"use client";

import {
  Activity,
  CircleAlert,
  Database,
  Gauge,
  Info,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { formatEther } from "viem";

import { useHealthFactor } from "@/hooks/use-health-factor";
import type { HealthFactorState } from "@/types/health-factor";
import {
  formatDscSupply,
  formatHealthFactor,
  formatUsdValue,
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

function getHealthFactorState(value?: bigint): HealthFactorState {
  if (value === undefined) {
    return {
      level: "loading",
      label: "Loading",
      description: "Reading your health factor from DSCEngine.",
      progress: 0,
      isSafe: false,
      badgeText: "Loading",
    };
  }

  const healthFactor = Number(formatEther(value));

  if (healthFactor >= 2) {
    return {
      level: "healthy",
      label: "Healthy",
      description:
        "Your position is safely collateralized and far from liquidation.",
      progress: 100,
      isSafe: true,
      badgeText: "Safe",
    };
  }

  if (healthFactor >= 1.2) {
    return {
      level: "moderate",
      label: "Moderate Risk",
      description:
        "Your position is still above the minimum, but risk is increasing.",
      progress: 65,
      isSafe: true,
      badgeText: "Watch",
    };
  }

  if (healthFactor >= 1) {
    return {
      level: "high-risk",
      label: "High Risk",
      description:
        "Your position is close to liquidation. Consider repaying DSC or adding collateral.",
      progress: 40,
      isSafe: false,
      badgeText: "Risk",
    };
  }

  return {
    level: "liquidatable",
    label: "Liquidatable",
    description:
      "Your health factor is below the safe threshold and the position may be liquidated.",
    progress: 15,
    isSafe: false,
    badgeText: "Danger",
  };
}

type RiskMetricProps = {
  label: string;
  value: string;
  description: string;
};

function RiskMetric({ label, value, description }: RiskMetricProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

type RiskRuleProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

function RiskRule({ icon, title, description }: RiskRuleProps) {
  return (
    <div className="flex gap-3 rounded-xl border bg-muted/20 p-4">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function HealthFactor() {
  const { wallet, risk, status } = useHealthFactor();

  const healthFactorState = getHealthFactorState(risk.healthFactor);

  return (
    <Card id="health-factor" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="size-5" />
              Health Factor
            </CardTitle>
            <CardDescription>
              Decentralized StableCoin local demo dashboard.
            </CardDescription>
          </div>

          <Badge
            variant={healthFactorState.isSafe ? "default" : "secondary"}
            className="gap-1"
          >
            {healthFactorState.isSafe ? (
              <ShieldCheck className="size-3" />
            ) : (
              <ShieldAlert className="size-3" />
            )}
            {healthFactorState.badgeText}
          </Badge>
        </div>

        {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read health factor data. Please check whether Anvil is
            running, contracts are deployed, and your wallet is connected to the
            local network.
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
              {wallet.hasWallet ? "Risk View Active" : "No Wallet"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <RiskMetric
            label="Health Factor"
            value={formatHealthFactor(risk.healthFactor)}
            description="A value above 1.00 means the position is above the liquidation threshold."
          />

          <RiskMetric
            label="Collateral Value"
            value={formatUsdValue(risk.collateralValueInUsd)}
            description="Total deposited collateral value calculated by DSCEngine."
          />

          <RiskMetric
            label="Minted DSC Debt"
            value={formatDscSupply(risk.totalDscMinted)}
            description="Total DSC minted by this wallet."
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {healthFactorState.isSafe ? (
              <ShieldCheck className="size-4" />
            ) : (
              <CircleAlert className="size-4" />
            )}
            <h3 className="text-sm font-medium">Risk Level</h3>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold">
                  {healthFactorState.label}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {healthFactorState.description}
                </p>
              </div>

              <div className="rounded-lg border bg-background/60 px-3 py-2 text-right">
                <p className="text-xs text-muted-foreground">Current HF</p>
                <p className="text-lg font-semibold">
                  {formatHealthFactor(risk.healthFactor)}
                </p>
              </div>
            </div>

            <Progress value={healthFactorState.progress} className="mt-4" />

            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
              <span>Liquidatable &lt; 1.00</span>
              <span>High Risk 1.00+</span>
              <span>Moderate 1.20+</span>
              <span>Healthy 2.00+</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <h3 className="text-sm font-medium">
              How to Improve Health Factor
            </h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <RiskRule
              icon={<TrendingDown className="size-4" />}
              title="Repay DSC"
              description="Burning part of your DSC debt reduces the denominator of the risk calculation."
            />

            <RiskRule
              icon={<Wallet className="size-4" />}
              title="Add Collateral"
              description="Depositing more WETH or WBTC increases your collateral value."
            />

            <RiskRule
              icon={<Activity className="size-4" />}
              title="Watch Price Changes"
              description="If collateral prices fall, your health factor can drop even without new actions."
            />
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            This panel reads risk data directly from DSCEngine. In this demo, a
            health factor below 1.00 means the account can be used in the
            liquidation flow.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
