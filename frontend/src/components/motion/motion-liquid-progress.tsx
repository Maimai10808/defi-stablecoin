"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MotionLiquidProgressProps = { value: number; label?: string; className?: string };

export function MotionLiquidProgress({ value, label, className }: MotionLiquidProgressProps) {
  const reduce = useReducedMotion();
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className={`overflow-hidden rounded-xl border bg-muted/20 p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between text-sm"><span className="font-medium">{label ?? "Collateral Capacity"}</span><span className="text-muted-foreground">{safeValue.toFixed(0)}%</span></div>
      <div className="relative h-28 overflow-hidden rounded-xl border bg-background">
        <motion.div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-500/60 to-emerald-300/35" initial={{ height: "0%" }} animate={{ height: `${safeValue}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
        {!reduce ? <motion.div className="absolute -left-1/2 bottom-[calc(var(--wave-bottom,0%)-8px)] h-7 w-[200%] rounded-[50%] bg-white/20" style={{ "--wave-bottom": `${safeValue}%` } as React.CSSProperties} animate={{ x: ["0%", "25%", "0%"] }} transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }} /> : null}
      </div>
    </div>
  );
}
