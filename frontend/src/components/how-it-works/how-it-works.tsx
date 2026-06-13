"use client";

import { ArrowRight, Code2, Database, FileCode2, Wallet } from "lucide-react";
import {useTranslations} from "next-intl";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionCard, MotionProtocolBeam, MotionRevealList } from "@/components/motion";

export function HowItWorks() {
  const t = useTranslations("HowItWorks");
  const tShell = useTranslations("Shell");
  const flowItems = [
    {key: "contracts", icon: FileCode2},
    {key: "sync", icon: Database},
    {key: "codegen", icon: Code2},
    {key: "dashboard", icon: Wallet},
  ] as const;

  return (
    <MotionCard>
      <Card id="how-it-works" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="size-5" />
          {tShell("views.how-it-works.title")}
        </CardTitle>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <MotionProtocolBeam
          labels={["Foundry", "Sync", "Wagmi", "Dashboard"]}
          className="mb-4"
        />

        <MotionRevealList className="grid gap-3 lg:grid-cols-4">
          {flowItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.key} className="relative">
                <div className="h-full rounded-xl border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{t(`items.${item.key}.title`)}</p>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {t(`items.${item.key}.description`)}
                  </p>
                </div>

                {index < flowItems.length - 1 ? (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground lg:block" />
                ) : null}
              </div>
            );
          })}
        </MotionRevealList>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
