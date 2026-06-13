"use client";

import {
  BookOpen,
  CheckCircle2,
  Coins,
  Gauge,
  Layers,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {useTranslations} from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionCard, MotionRevealList } from "@/components/motion";

export function ProjectGuide() {
  const t = useTranslations("ProjectGuide");
  const tShell = useTranslations("Shell");
  const overviewItems = [
    {key: "stablecoin", icon: Coins},
    {key: "health", icon: Gauge},
    {key: "liquidation", icon: ShieldCheck},
  ] as const;
  const guideItems = [
    {key: "wallet", icon: CheckCircle2},
    {key: "tokens", icon: PlayCircle},
    {key: "flow", icon: Layers},
  ] as const;

  return (
    <MotionCard>
      <Card id="project-guide" className="scroll-mt-20 overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                {tShell("views.project-guide.title")}
              </CardTitle>

              <CardDescription>
                {tShell("views.project-guide.description")}
              </CardDescription>
            </div>

            <Badge variant="outline" className="w-fit gap-1">
              <Sparkles className="size-3" />
              {t("badge")}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl border bg-background">
                <LockKeyhole className="size-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-semibold">{t("overviewTitle")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("overviewSubtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>{t("overview")}</p>
            </div>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-3">
            {overviewItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-xl border bg-muted/20 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium">{t(`concepts.${item.key}.title`)}</p>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {t(`concepts.${item.key}.description`)}
                  </p>
                </div>
              );
            })}
          </MotionRevealList>

          <div className="rounded-lg border bg-background p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold">{t("howToTitle")}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("howToSubtitle")}
              </p>
            </div>

            <MotionRevealList className="grid gap-3 md:grid-cols-3">
              {guideItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{t(`steps.${item.key}.title`)}</p>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {t(`steps.${item.key}.description`)}
                    </p>
                  </div>
                );
              })}
            </MotionRevealList>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">{t("summaryLabel")} </span>
            {t("summary")}
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
