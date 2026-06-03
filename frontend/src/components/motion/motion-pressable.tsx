"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type MotionPressableProps = { children: React.ReactNode; className?: string; disabled?: boolean };

export function MotionPressable({ children, className, disabled = false }: MotionPressableProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div whileHover={disabled || reduce ? undefined : { y: -2, scale: 1.006 }} whileTap={disabled || reduce ? undefined : { y: 0, scale: 0.985 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className={className}>
      {children}
    </motion.div>
  );
}
