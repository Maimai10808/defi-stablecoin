"use client";

import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  Calculator,
  CircleAlert,
  Database,
  Gauge,
  Info,
  Scale,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { BlockMath, InlineMath } from "react-katex";
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
import {
  MotionCard,
  MotionErrorShake,
  MotionHealthFactor,
  MotionHealthFactorText,
  MotionLiquidProgress,
  MotionRevealList,
  MotionValueText,
} from "@/components/motion";

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
  value: ReactNode;
  description: string;
};

function RiskMetric({ label, value, description }: RiskMetricProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
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

type FlowStepProps = {
  step: string;
  title: string;
  formula: string;
  description: string;
};

function FlowStep({ step, title, formula, description }: FlowStepProps) {
  return (
    <div className="rounded-xl border bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {step}
        </div>
        <p className="text-sm font-medium">{title}</p>
      </div>

      <div className="mb-3 rounded-lg border bg-background/70 px-3 py-2 text-center">
        <InlineMath math={formula} />
      </div>

      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function HealthFactor() {
  const { wallet, risk, status } = useHealthFactor();

  const healthFactorState = getHealthFactorState(risk.healthFactor);

  return (
    <MotionCard>
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

        <MotionErrorShake trigger={status.hasReadError}>
          {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read health factor data. Please check whether Anvil is
            running, contracts are deployed, and your wallet is connected to the
            local network.
          </div>
          ) : null}
        </MotionErrorShake>
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
            value={<MotionHealthFactorText value={risk.healthFactor} />}
            description="A value above 1.00 means the position is above the liquidation threshold."
          />

          <RiskMetric
            label="Collateral Value"
            value={
              <MotionValueText
                value={risk.collateralValueInUsd}
                prefix="$"
                decimals={2}
              />
            }
            description="Total deposited collateral value calculated by DSCEngine."
          />

          <RiskMetric
            label="Minted DSC Debt"
            value={
              <MotionValueText
                value={risk.totalDscMinted}
                suffix=" DSC"
                decimals={2}
              />
            }
            description="Total DSC minted by this wallet."
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-4" />
            <h3 className="text-sm font-medium">Health Factor Model</h3>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border bg-muted/20 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border bg-background p-2">
                  <Scale className="size-5 text-muted-foreground" />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Health Factor is the protocol&apos;s core solvency metric.
                  </p>

                  <p className="text-sm leading-6 text-muted-foreground">
                    It measures whether a user&apos;s liquidation-adjusted
                    collateral value is sufficient to cover their minted DSC
                    debt. A higher value means the account has more safety
                    margin. Once the value falls below{" "}
                    <InlineMath math={"1.0"} />, the position becomes eligible
                    for liquidation.
                  </p>

                  <div className="rounded-lg border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                    In this demo, the liquidation threshold is{" "}
                    <InlineMath math={"50\\%"} />, meaning only half of the
                    collateral value is treated as safe borrowing capacity.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-linear-to-br from-muted/50 via-background to-background p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Formal Definition
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    Liquidation-adjusted collateral ratio
                  </p>
                </div>

                <Badge variant="outline">DSCEngine</Badge>
              </div>

              <div className="rounded-xl border bg-background/80 px-4 py-6 shadow-sm">
                <BlockMath
                  math={
                    "\\mathrm{HF}(u)=\\frac{V_{c}(u)\\cdot \\lambda}{D_{dsc}(u)}"
                  }
                />

                <Separator className="my-4" />

                <div className="grid gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <InlineMath math={"V_c(u)"} /> = collateral value of user{" "}
                      <InlineMath math={"u"} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <InlineMath math={"\\lambda"} /> = liquidation threshold
                    </span>
                    <Badge variant="secondary">50%</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <InlineMath math={"D_{dsc}(u)"} /> = total DSC debt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expanded Protocol Formula
            </p>

            <div className="rounded-xl border bg-background/80 px-4 py-6 shadow-sm">
              <BlockMath
                math={
                  "\\mathrm{HF}(u)=\\frac{\\left(\\sum_{i=1}^{n} q_i(u)\\cdot p_i\\right)\\cdot \\lambda}{D_{dsc}(u)}"
                }
              />

              <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">
                    <InlineMath math={"q_i(u)"} />
                  </p>
                  <p className="mt-1">
                    Amount of collateral token <InlineMath math={"i"} />{" "}
                    deposited by the user.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">
                    <InlineMath math={"p_i"} />
                  </p>
                  <p className="mt-1">
                    USD oracle price of collateral token{" "}
                    <InlineMath math={"i"} />.
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">
                    <InlineMath math={"D_{dsc}(u)"} />
                  </p>
                  <p className="mt-1">
                    Total DSC minted by the user and not yet repaid.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4" />
            <h3 className="text-sm font-medium">Calculation Flow</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <FlowStep
              step="1"
              title="Collateral Valuation"
              formula={"V_c(u)=\\sum q_i(u)\\cdot p_i"}
              description="DSCEngine converts deposited WETH and WBTC into USD value using price feeds."
            />

            <FlowStep
              step="2"
              title="Risk Adjustment"
              formula={"V_{adj}(u)=V_c(u)\\cdot \\lambda"}
              description="The collateral value is multiplied by the liquidation threshold to obtain safe borrowing capacity."
            />

            <FlowStep
              step="3"
              title="Debt Normalization"
              formula={"\\mathrm{HF}(u)=V_{adj}(u)/D_{dsc}(u)"}
              description="The adjusted collateral value is divided by minted DSC debt to produce the final health factor."
            />
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Collateral Value
                </p>
                <p className="mt-1 font-semibold">
                  {formatUsdValue(risk.collateralValueInUsd)}
                </p>
              </div>

              <ArrowRight className="hidden size-4 text-muted-foreground md:block" />

              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  Liquidation Threshold
                </p>
                <p className="mt-1 font-semibold">
                  <InlineMath math={"\\times\\ 50\\%"} />
                </p>
              </div>

              <ArrowRight className="hidden size-4 text-muted-foreground md:block" />

              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">DSC Debt</p>
                <p className="mt-1 font-semibold">
                  {formatDscSupply(risk.totalDscMinted)}
                </p>
              </div>

              <ArrowRight className="hidden size-4 text-muted-foreground md:block" />

              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Health Factor</p>
                <p className="mt-1 font-semibold">
                  {formatHealthFactor(risk.healthFactor)}
                </p>
              </div>
            </div>
          </div>
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

          <MotionHealthFactor
            value={
              risk.healthFactor === undefined
                ? undefined
                : Number(formatEther(risk.healthFactor))
            }
          >
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
                <div className="text-lg font-semibold">
                  <MotionHealthFactorText value={risk.healthFactor} />
                </div>
              </div>
            </div>

            <Progress value={healthFactorState.progress} className="mt-4" />
            <MotionLiquidProgress
              value={healthFactorState.progress}
              label="Liquidation Distance"
              className="mt-4"
            />

            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
              <span>Liquidatable &lt; 1.00</span>
              <span>High Risk 1.00+</span>
              <span>Moderate 1.20+</span>
              <span>Healthy 2.00+</span>
            </div>
            </div>
          </MotionHealthFactor>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <h3 className="text-sm font-medium">
              How to Improve Health Factor
            </h3>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-3">
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
          </MotionRevealList>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            This panel reads risk data directly from DSCEngine. In this demo, a
            health factor below <InlineMath math={"1.0"} /> means the account
            can be used in the liquidation flow.
          </p>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
