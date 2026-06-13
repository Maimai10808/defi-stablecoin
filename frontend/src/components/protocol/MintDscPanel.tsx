"use client";

import { CircleAlert, Coins, Loader2 } from "lucide-react";
import {useTranslations} from "next-intl";

import { MotionHealthFactorText, MotionNumberText, MotionPressable, MotionValueText } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDepositMint } from "@/hooks/use-deposit-mint";
import { useMyPosition } from "@/hooks/use-my-position";

import {
  bigintToNumber,
  estimateHealthFactor,
  estimateMaxAdditionalMint,
  formatEstimatedHealthFactor,
  MIN_HEALTH_FACTOR,
  parsePositiveAmount,
} from "./protocol-calculations";

export function MintDscPanel() {
  const t = useTranslations("ProtocolFlow.mint");
  const tCommon = useTranslations("Common");
  const { form, status, actions } = useDepositMint();
  const { wallet, position } = useMyPosition();
  const collateralUsd = bigintToNumber(position.collateralValueInUsd);
  const currentDebt = bigintToNumber(position.totalDscMinted);
  const mintAmount = parsePositiveAmount(form.dscAmountToMint);
  const maxMintableDsc = estimateMaxAdditionalMint(collateralUsd, currentDebt);
  const healthFactorAfter = estimateHealthFactor(collateralUsd, currentDebt + mintAmount);
  const noCollateral = collateralUsd <= 0;
  const unsafeMint = mintAmount > maxMintableDsc || healthFactorAfter < MIN_HEALTH_FACTOR;
  const canMint =
    wallet.hasWallet &&
    mintAmount > 0 &&
    !noCollateral &&
    !status.isMinting;

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Coins className="size-4" />
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>
          <Badge variant="outline">{tCommon("step", {number: 2})}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("currentCollateral")}>
            <MotionValueText value={position.collateralValueInUsd} prefix="$" decimals={2} />
          </Metric>
          <Metric label={t("currentMinted")}>
            <MotionValueText value={position.totalDscMinted} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label={t("maxMintable")}>
            <MotionNumberText value={maxMintableDsc} suffix=" DSC" decimals={2} />
          </Metric>
          <Metric label={t("healthBefore")}>
            <MotionHealthFactorText value={position.healthFactor} />
          </Metric>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mint-dsc-amount">{t("amount")}</Label>
          <Input
            id="mint-dsc-amount"
            value={form.dscAmountToMint}
            inputMode="decimal"
            placeholder="500"
            disabled={!wallet.hasWallet}
            onChange={(event) => actions.updateField("dscAmountToMint", event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {t("healthAfter")}{" "}
            <span className="font-medium text-foreground">
              {formatEstimatedHealthFactor(healthFactorAfter)}
            </span>
          </p>
        </div>

        {noCollateral ? (
          <Notice>{t("depositFirst")}</Notice>
        ) : unsafeMint && mintAmount > 0 ? (
          <Notice destructive>
            {t("unsafe")}
          </Notice>
        ) : (
          <Notice>
            {t("backed")}
          </Notice>
        )}

        <MotionPressable disabled={!canMint}>
          <Button type="button" disabled={!canMint} onClick={actions.mintOnlyDsc}>
            {status.isMinting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("submit")}
          </Button>
        </MotionPressable>
      </CardContent>
    </Card>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-base font-semibold">{children}</div>
    </div>
  );
}

function Notice({ children, destructive = false }: { children: React.ReactNode; destructive?: boolean }) {
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${destructive ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}>
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {children}
    </div>
  );
}
