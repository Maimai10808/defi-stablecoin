"use client";

import * as React from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";

export type MotionScanButtonProps = HTMLMotionProps<"button"> & {
  children: React.ReactNode;
};

export function MotionScanButton({ children, className, disabled, ...props }: MotionScanButtonProps) {
  const reduce = useReducedMotion();
  return (
    <motion.button whileTap={disabled || reduce ? undefined : { scale: 0.975 }} whileHover={disabled || reduce ? undefined : { y: -1 }} className={`relative overflow-hidden rounded-md border px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`} disabled={disabled} {...props}>
      <span className="relative z-10">{children}</span>
      {!disabled && !reduce ? <motion.span aria-hidden className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent" animate={{ x: ["0%", "420%"] }} transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }} /> : null}
    </motion.button>
  );
}
