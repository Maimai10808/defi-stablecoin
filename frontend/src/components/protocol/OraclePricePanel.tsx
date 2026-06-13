"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import {
  AlertTriangle,
  ArrowDownRight,
  Loader2,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Waves,
} from "lucide-react";
import { toast } from "sonner";

import {
  MotionNumberText,
  MotionPressable,
  MotionSkeleton,
} from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OraclePrices = {
  wethUsd: string;
  wbtcUsd: string;
  source: string;
  updatedAt: number;
};

type OracleError = {
  error?: string;
};

export function OraclePricePanel() {
  const t = useTranslations("Oracle");
  const queryClient = useQueryClient();
  const [prices, setPrices] = React.useState<OraclePrices>();
  const [error, setError] = React.useState<string>();
  const [liveFluctuation, setLiveFluctuation] = React.useState(true);
  const [pendingAction, setPendingAction] = React.useState<
    "refresh" | "drop" | "recover"
  >();

  const requestPrices = React.useCallback(
    async (
      action: "refresh" | "drop" | "recover" | "tick" = "refresh",
      silent = false,
    ) => {
      if (!silent) {
        setPendingAction(action === "tick" ? undefined : action);
        setError(undefined);
      }

      try {
        const response = await fetch(
          action === "refresh" ? "/api/oracle/prices" : `/api/oracle/${action}`,
          { method: action === "refresh" ? "GET" : "POST" },
        );
        const result = (await response.json()) as OraclePrices & OracleError;

        if (!response.ok) {
          throw new Error(result.error ?? t("unavailable"));
        }

        setPrices(result);
        await queryClient.invalidateQueries();

        if (action === "drop") {
          toast.success(
            t("dropSuccess"),
          );
        }
        if (action === "recover") {
          toast.success(t("resetSuccess"));
        }
      } catch (requestError) {
        if (!silent) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : t("unavailable"),
          );
        }
      } finally {
        if (!silent) {
          setPendingAction(undefined);
        }
      }
    },
    [queryClient, t],
  );

  React.useEffect(() => {
    const timeout = window.setTimeout(() => void requestPrices(), 0);
    return () => window.clearTimeout(timeout);
  }, [requestPrices]);

  React.useEffect(() => {
    if (!liveFluctuation) return;

    const interval = window.setInterval(
      () => void requestPrices("tick", true),
      8000,
    );

    return () => window.clearInterval(interval);
  }, [liveFluctuation, requestPrices]);

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RadioTower className="size-4" />
              {t("title")}
            </CardTitle>
            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>
          <Badge variant={liveFluctuation ? "default" : "outline"}>
            {liveFluctuation ? t("live") : t("paused")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <PriceMetric label="WETH / USD" value={prices?.wethUsd} />
          <PriceMetric label="WBTC / USD" value={prices?.wbtcUsd} />
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : (
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            {t("risk")}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <OracleButton
            label={liveFluctuation ? t("pause") : t("resume")}
            pending={false}
            disabled={pendingAction !== undefined}
            icon={Waves}
            onClick={() => setLiveFluctuation((current) => !current)}
          />
          <OracleButton
            label={t("refresh")}
            pending={pendingAction === "refresh"}
            disabled={pendingAction !== undefined}
            icon={RefreshCw}
            onClick={() => void requestPrices("refresh")}
          />
          <OracleButton
            label={t("drop")}
            pending={pendingAction === "drop"}
            disabled={pendingAction !== undefined}
            icon={ArrowDownRight}
            onClick={() => void requestPrices("drop")}
          />
          <OracleButton
            label={t("reset")}
            pending={pendingAction === "recover"}
            disabled={pendingAction !== undefined}
            icon={RotateCcw}
            onClick={() => void requestPrices("recover")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PriceMetric({ label, value }: { label: string; value?: string }) {
  const t = useTranslations("Oracle");
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-xl font-semibold">
        {value === undefined ? (
          <MotionSkeleton className="h-7 w-28" />
        ) : (
          <MotionNumberText value={Number(value)} prefix="$" decimals={2} />
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("title")}
      </p>
    </div>
  );
}

function OracleButton({
  label,
  pending,
  disabled,
  icon: Icon,
  onClick,
}: {
  label: string;
  pending: boolean;
  disabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <MotionPressable disabled={disabled}>
      <Button type="button" variant="outline" disabled={disabled} onClick={onClick}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Icon className="size-4" />}
        {label}
      </Button>
    </MotionPressable>
  );
}
