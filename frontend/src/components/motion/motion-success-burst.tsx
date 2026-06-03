"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type MotionSuccessBurstProps = { show: boolean; particleCount?: number; className?: string };

export function MotionSuccessBurst({ show, particleCount = 16, className }: MotionSuccessBurstProps) {
  const reduce = useReducedMotion();
  const particles = React.useMemo(() => Array.from({ length: particleCount }, (_, index) => ({ id: index, angle: (Math.PI * 2 * index) / particleCount, distance: 34 + (index % 4) * 8 })), [particleCount]);
  return (
    <span className={`pointer-events-none relative inline-flex ${className ?? ""}`}>
      <AnimatePresence>
        {show && !reduce ? particles.map((p) => (
          <motion.span key={p.id} className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-emerald-400" initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }} animate={{ opacity: [0, 1, 0], x: Math.cos(p.angle) * p.distance, y: Math.sin(p.angle) * p.distance, scale: [0.4, 1, 0.6] }} exit={{ opacity: 0 }} transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }} />
        )) : null}
      </AnimatePresence>
    </span>
  );
}
