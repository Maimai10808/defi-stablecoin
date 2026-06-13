"use client";

import {
  CheckCircle2,
  CircleAlert,
  Clock3,
  Database,
  ExternalLink,
  ListChecks,
  Trash2,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useActivityLog } from "@/hooks/use-activity-log";
import { shortAddress } from "@/lib/format";
import type { ActivityLogItem, ActivityLogStatus } from "@/types/activity-log";
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
  MotionNumberText,
  MotionPressable,
  MotionStreamRow,
} from "@/components/motion";

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function getStatusIcon(status: ActivityLogStatus) {
  if (status === "success") return <CheckCircle2 className="size-3" />;

  if (status === "failed") return <CircleAlert className="size-3" />;

  return <Clock3 className="size-3" />;
}

function getStatusVariant(status: ActivityLogStatus) {
  if (status === "success") return "default";

  if (status === "failed") return "destructive";

  return "secondary";
}

type ActivityLogRowProps = {
  item: ActivityLogItem;

  onRemove: (id: string) => void;
};

function ActivityLogRow({ item, onRemove }: ActivityLogRowProps) {
  const t = useTranslations("ActivityLog");

  return (
    <MotionStreamRow className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{item.title}</p>

            <Badge variant={getStatusVariant(item.status)} className="gap-1">
              {getStatusIcon(item.status)}

              {t(item.status)}
            </Badge>

            <Badge variant="outline">{item.type}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">{item.description}</p>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{formatTime(item.createdAt)}</span>

            {item.account ? (
              <span>{t("account")}: {shortAddress(item.account)}</span>
            ) : null}

            {item.txHash ? <span>{t("transaction")}: {shortAddress(item.txHash)}</span> : null}
          </div>
        </div>

        <MotionPressable>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onRemove(item.id)}
          >
            <X className="size-4" />
          </Button>
        </MotionPressable>
      </div>

      {item.txHash ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <MotionPressable>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href={`#tx-${item.txHash}`}>
                {t("viewTransaction")}
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          </MotionPressable>

          <MotionCopyButton value={item.txHash} label={t("copyTransaction")} />
        </div>
      ) : null}
    </MotionStreamRow>
  );
}

export function ActivityLog() {
  const t = useTranslations("ActivityLog");
  const { logs, hasLogs, removeLog, clearLogs, addPendingLog } =
    useActivityLog();

  function addDemoLog() {
    addPendingLog({
      type: "system",

      title: t("demoTitle"),

      description: t("demoDescription"),
    });
  }

  return (
    <MotionCard>
      <Card id="activity-log" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-5" />
              {t("title")}
            </CardTitle>

            <CardDescription>
              {t("description")}
            </CardDescription>
          </div>

          <Badge variant={hasLogs ? "default" : "secondary"} className="gap-1">
            <Database className="size-3" />
            <MotionNumberText value={logs.length} decimals={0} /> {t("records")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("tracking")}
          </p>

          <div className="flex gap-2">
            <MotionPressable>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDemoLog}
              >
                {t("addDemo")}
              </Button>
            </MotionPressable>

            <MotionPressable disabled={!hasLogs}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearLogs}
                disabled={!hasLogs}
              >
                <Trash2 className="mr-2 size-4" />
                {t("clear")}
              </Button>
            </MotionPressable>
          </div>
        </div>

        <Separator />

        {hasLogs ? (
          <div className="space-y-3">
            {logs.map((item) => (
              <ActivityLogRow key={item.id} item={item} onRemove={removeLog} />
            ))}
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border bg-muted/20 p-6 text-center">
            <ListChecks className="mb-3 size-8 text-muted-foreground" />

            <p className="font-medium">{t("empty")}</p>

            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {t("emptyDescription")}
            </p>
          </div>
        )}
      </CardContent>
      </Card>
    </MotionCard>
  );
}
