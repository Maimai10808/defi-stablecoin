"use client";

import * as React from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";

export type MotionErrorShakeProps = { trigger: unknown; children: React.ReactNode; className?: string };

export function MotionErrorShake({ trigger, children, className }: MotionErrorShakeProps) {
  const controls = useAnimationControls();
  const reduce = useReducedMotion();
  React.useEffect(() => {
    if (!trigger || reduce) return;
    controls.start({ x: [0, -8, 7, -5, 4, 0], transition: { duration: 0.38, ease: "easeInOut" } });
  }, [controls, reduce, trigger]);
  return <motion.div animate={controls} className={className}>{children}</motion.div>;
}
