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
import { useTranslations } from "next-intl";

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
      label: "loading",
      description: "loadingDescription",
      progress: 0,
      isSafe: false,
      badgeText: "loading",
    };
  }

  const healthFactor = Number(formatEther(value));

  if (healthFactor >= 2) {
    return {
      level: "healthy",
      label: "healthy",
      description: "healthyDescription",
      progress: 100,
      isSafe: true,
      badgeText: "safe",
    };
  }

  if (healthFactor >= 1.2) {
    return {
      level: "moderate",
      label: "moderate",
      description: "moderateDescription",
      progress: 65,
      isSafe: true,
      badgeText: "watch",
    };
  }

  if (healthFactor >= 1) {
    return {
      level: "high-risk",
      label: "highRisk",
      description: "highRiskDescription",
      progress: 40,
      isSafe: false,
      badgeText: "risk",
    };
  }

  return {
    level: "liquidatable",
    label: "liquidatable",
    description: "liquidatableDescription",
    progress: 15,
    isSafe: false,
    badgeText: "danger",
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
  const t = useTranslations("HealthFactor");
  const tCommon = useTranslations("Common");
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
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
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
            {t(`states.${healthFactorState.badgeText}`)}
          </Badge>
        </div>

        <MotionErrorShake trigger={status.hasReadError}>
          {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t("readError")}
          </div>
          ) : null}
        </MotionErrorShake>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">{t("connectedAccount")}</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {shortAddress(wallet.address)}
              </p>
            </div>

            <Badge variant="outline">
              {wallet.hasWallet ? t("riskViewActive") : tCommon("noWallet")}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <RiskMetric
            label={t("healthFactor")}
            value={<MotionHealthFactorText value={risk.healthFactor} />}
            description={t("healthMetricDescription")}
          />

          <RiskMetric
            label={t("collateralValue")}
            value={
              <MotionValueText
                value={risk.collateralValueInUsd}
                prefix="$"
                decimals={2}
              />
            }
            description={t("collateralDescription")}
          />

          <RiskMetric
            label={t("mintedDebt")}
            value={
              <MotionValueText
                value={risk.totalDscMinted}
                suffix=" DSC"
                decimals={2}
              />
            }
            description={t("mintedDebtDescription")}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-4" />
            <h3 className="text-sm font-medium">{t("model")}</h3>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1.1fr]">
            <div className="rounded-xl border bg-muted/20 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border bg-background p-2">
                  <Scale className="size-5 text-muted-foreground" />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    {t("modelIntro")}
                  </p>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("modelDescription")}
                  </p>

                  <div className="rounded-lg border bg-background/70 px-3 py-2 text-sm text-muted-foreground">
                    {t("thresholdExplanation")}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-linear-to-br from-muted/50 via-background to-background p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("formalDefinition")}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    {t("adjustedRatio")}
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
                      <InlineMath math={"V_c(u)"} /> = {t("collateralVariable")}{" "}
                      <InlineMath math={"u"} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <InlineMath math={"\\lambda"} /> = {t("thresholdVariable")}
                    </span>
                    <Badge variant="secondary">50%</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>
                      <InlineMath math={"D_{dsc}(u)"} /> = {t("debtVariable")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/20 p-5">
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("expandedFormula")}
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
                    {t("quantityDescription")}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">
                    <InlineMath math={"p_i"} />
                  </p>
                  <p className="mt-1">
                    {t("priceDescription")}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-3">
                  <p className="font-medium text-foreground">
                    <InlineMath math={"D_{dsc}(u)"} />
                  </p>
                  <p className="mt-1">
                    {t("debtDescription")}
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
            <h3 className="text-sm font-medium">{t("calculationFlow")}</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <FlowStep
              step="1"
              title={t("valuation")}
              formula={"V_c(u)=\\sum q_i(u)\\cdot p_i"}
              description={t("valuationDescription")}
            />

            <FlowStep
              step="2"
              title={t("riskAdjustment")}
              formula={"V_{adj}(u)=V_c(u)\\cdot \\lambda"}
              description={t("riskAdjustmentDescription")}
            />

            <FlowStep
              step="3"
              title={t("debtNormalization")}
              formula={"\\mathrm{HF}(u)=V_{adj}(u)/D_{dsc}(u)"}
              description={t("debtNormalizationDescription")}
            />
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center">
              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("collateralValue")}
                </p>
                <p className="mt-1 font-semibold">
                  {formatUsdValue(risk.collateralValueInUsd)}
                </p>
              </div>

              <ArrowRight className="hidden size-4 text-muted-foreground md:block" />

              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">
                  {t("liquidationThreshold")}
                </p>
                <p className="mt-1 font-semibold">
                  <InlineMath math={"\\times\\ 50\\%"} />
                </p>
              </div>

              <ArrowRight className="hidden size-4 text-muted-foreground md:block" />

              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">{t("dscDebt")}</p>
                <p className="mt-1 font-semibold">
                  {formatDscSupply(risk.totalDscMinted)}
                </p>
              </div>

              <ArrowRight className="hidden size-4 text-muted-foreground md:block" />

              <div className="rounded-lg border bg-background px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">{t("healthFactor")}</p>
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
            <h3 className="text-sm font-medium">{t("riskLevel")}</h3>
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
                  {t(`states.${healthFactorState.label}`)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(`states.${healthFactorState.description}`)}
                </p>
              </div>

              <div className="rounded-lg border bg-background/60 px-3 py-2 text-right">
                <p className="text-xs text-muted-foreground">{t("currentHf")}</p>
                <div className="text-lg font-semibold">
                  <MotionHealthFactorText value={risk.healthFactor} />
                </div>
              </div>
            </div>

            <Progress value={healthFactorState.progress} className="mt-4" />
            <MotionLiquidProgress
              value={healthFactorState.progress}
              label={t("liquidationDistance")}
              className="mt-4"
            />

            <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
              <span>{t("liquidatableRange")}</span>
              <span>{t("highRiskRange")}</span>
              <span>{t("moderateRange")}</span>
              <span>{t("healthyRange")}</span>
            </div>
            </div>
          </MotionHealthFactor>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="size-4" />
            <h3 className="text-sm font-medium">
              {t("improve")}
            </h3>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-3">
            <RiskRule
              icon={<TrendingDown className="size-4" />}
              title={t("repay")}
              description={t("repayDescription")}
            />

            <RiskRule
              icon={<Wallet className="size-4" />}
              title={t("addCollateral")}
              description={t("addCollateralDescription")}
            />

            <RiskRule
              icon={<Activity className="size-4" />}
              title={t("watchPrices")}
              description={t("watchPricesDescription")}
            />
          </MotionRevealList>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <p>
            {t("footer")}
          </p>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
