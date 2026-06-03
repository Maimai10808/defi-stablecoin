"use client";

import { motion, useReducedMotion } from "framer-motion";

export type MotionProtocolBeamProps = { active?: boolean; className?: string; labels?: [string, string, string, string] };

export function MotionProtocolBeam({ active = true, className, labels = ["Wallet", "Collateral", "Engine", "DSC"] }: MotionProtocolBeamProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`rounded-xl border bg-muted/20 p-4 ${className ?? ""}`}>
      <div className="grid grid-cols-4 gap-2 text-center text-xs text-muted-foreground">{labels.map((label) => <span key={label}>{label}</span>)}</div>
      <div className="relative mt-4 h-12">
        <div className="absolute left-[12.5%] right-[12.5%] top-1/2 h-px bg-border" />
        {labels.map((label, index) => <div key={label} className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border bg-background" style={{ left: `calc(${12.5 + index * 25}% - 0.5rem)` }} />)}
        {active && !reduce ? <motion.div className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.8)]" animate={{ left: ["12.5%", "37.5%", "62.5%", "87.5%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }} /> : null}
      </div>
    </div>
  );
}
