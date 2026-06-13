"use client";

import {
  Activity,
  Coins,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Map,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import {useTranslations} from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionCard, MotionRevealList } from "@/components/motion";

export function FeatureMap() {
  const t = useTranslations("FeatureMap");
  const tShell = useTranslations("Shell");
  const features = [
    {key: "status", icon: LayoutDashboard},
    {key: "position", icon: Wallet},
    {key: "faucet", icon: Coins},
    {key: "deposit", icon: ListChecks},
    {key: "repay", icon: Activity},
    {key: "health", icon: Gauge},
    {key: "liquidation", icon: ShieldAlert},
  ] as const;

  return (
    <MotionCard>
      <Card id="feature-map" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="size-5" />
          {tShell("views.feature-map.title")}
        </CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <MotionRevealList className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.key}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{t(`features.${feature.key}.title`)}</p>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {t(`features.${feature.key}.description`)}
                </p>
              </div>
            );
          })}
        </MotionRevealList>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
