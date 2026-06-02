"use client";

import { create } from "zustand";

import type { ActivityLogItem } from "@/types/activity-log";

const STORAGE_KEY = "dsc-demo-activity-log";

type ActivityLogStore = {
  logs: ActivityLogItem[];
  addLog: (log: Omit<ActivityLogItem, "id" | "createdAt">) => void;
  removeLog: (id: string) => void;
  clearLogs: () => void;
  hydrateLogs: () => void;
};

function createLogId() {
  return `log-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function saveLogs(logs: ActivityLogItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function readLogs() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ActivityLogItem[];
  } catch {
    return [];
  }
}

export const useActivityLogStore = create<ActivityLogStore>((set, get) => ({
  logs: [],

  addLog: (log) => {
    const nextLogs: ActivityLogItem[] = [
      {
        ...log,
        id: createLogId(),
        createdAt: Date.now(),
      },
      ...get().logs,
    ].slice(0, 50);

    saveLogs(nextLogs);
    set({ logs: nextLogs });
  },

  removeLog: (id) => {
    const nextLogs = get().logs.filter((item) => item.id !== id);
    saveLogs(nextLogs);
    set({ logs: nextLogs });
  },

  clearLogs: () => {
    saveLogs([]);
    set({ logs: [] });
  },

  hydrateLogs: () => {
    set({ logs: readLogs() });
  },
}));
