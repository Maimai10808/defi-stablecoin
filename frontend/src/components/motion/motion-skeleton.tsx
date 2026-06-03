"use client";

import { motion, useReducedMotion } from "framer-motion";

export type MotionSkeletonProps = { className?: string };

export function MotionSkeleton({ className }: MotionSkeletonProps) {
  const reduce = useReducedMotion();
  return (
    <div className={`relative overflow-hidden rounded-md bg-muted ${className ?? "h-4 w-full"}`}>
      {!reduce ? <motion.div aria-hidden className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" animate={{ x: ["0%", "300%"] }} transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }} /> : null}
    </div>
  );
}
