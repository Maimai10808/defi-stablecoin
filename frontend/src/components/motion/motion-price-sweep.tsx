"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MotionPriceSweepProps = { children: React.ReactNode; active?: boolean; className?: string };

export function MotionPriceSweep({ children, active = true, className }: MotionPriceSweepProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {children}
      {active && !reduce ? <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" animate={{ x: ["0%", "300%"] }} transition={{ duration: 2.6, repeat: Infinity, ease: [0.22, 1, 0.36, 1], repeatDelay: 1.2 }} /> : null}
    </div>
  );
}
