"use client";

import { motion, useReducedMotion } from "framer-motion";

export type MotionOracleBeamProps = { fromLabel?: string; toLabel?: string; active?: boolean; className?: string };

export function MotionOracleBeam({ fromLabel = "Price Feed", toLabel = "DSCEngine", active = true, className }: MotionOracleBeamProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`rounded-xl border bg-muted/20 p-4 ${className ?? ""}`}>
      <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground"><span>{fromLabel}</span><span>{toLabel}</span></div>
      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        {active && !reduce ? <motion.div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent" animate={{ x: ["-110%", "330%"] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} /> : null}
      </div>
    </div>
  );
}
