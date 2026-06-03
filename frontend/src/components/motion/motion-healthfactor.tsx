"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MotionHealthFactorProps = { value?: number; dangerThreshold?: number; warningThreshold?: number; children: React.ReactNode; className?: string };

function getPulse(value?: number, dangerThreshold = 1, warningThreshold = 1.2) {
  if (value === undefined) return { opacity: 0.22, scale: 1.01 };
  if (value < dangerThreshold) return { opacity: 0.52, scale: 1.035 };
  if (value < warningThreshold) return { opacity: 0.34, scale: 1.02 };
  return { opacity: 0.2, scale: 1.01 };
}

export function MotionHealthFactor({ value, dangerThreshold = 1, warningThreshold = 1.2, children, className }: MotionHealthFactorProps) {
  const reduce = useReducedMotion();
  const pulse = getPulse(value, dangerThreshold, warningThreshold);
  return (
    <div className={className}>
      <div className="relative overflow-hidden rounded-xl">
        {!reduce ? (
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-xl border" animate={{ opacity: [pulse.opacity, pulse.opacity * 0.35, pulse.opacity], scale: [1, pulse.scale, 1] }} transition={{ duration: value !== undefined && value < dangerThreshold ? 1.1 : 2.2, repeat: Infinity, ease: "easeInOut" }} />
        ) : null}
        {children}
      </div>
    </div>
  );
}
