"use client";

import * as React from "react";

import { useActivityLogStore } from "@/stores/activity-log-store";
import type { ActivityLogItem } from "@/types/activity-log";

export function useActivityLog() {
  const logs = useActivityLogStore((state) => state.logs);
  const addLog = useActivityLogStore((state) => state.addLog);
  const removeLog = useActivityLogStore((state) => state.removeLog);
  const clearLogs = useActivityLogStore((state) => state.clearLogs);
  const hydrateLogs = useActivityLogStore((state) => state.hydrateLogs);

  React.useEffect(() => {
    hydrateLogs();
  }, [hydrateLogs]);

  const latestLogs = React.useMemo(() => {
    return [...logs].sort((a, b) => b.createdAt - a.createdAt);
  }, [logs]);

  function addSuccessLog(
    log: Omit<ActivityLogItem, "id" | "createdAt" | "status">,
  ) {
    addLog({
      ...log,
      status: "success",
    });
  }

  function addFailedLog(
    log: Omit<ActivityLogItem, "id" | "createdAt" | "status">,
  ) {
    addLog({
      ...log,
      status: "failed",
    });
  }

  function addPendingLog(
    log: Omit<ActivityLogItem, "id" | "createdAt" | "status">,
  ) {
    addLog({
      ...log,
      status: "pending",
    });
  }

  return {
    logs: latestLogs,
    addLog,
    addSuccessLog,
    addFailedLog,
    addPendingLog,
    removeLog,
    clearLogs,
    hasLogs: latestLogs.length > 0,
  };
}
