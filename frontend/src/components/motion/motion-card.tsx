"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

// Use motion's div props to ensure correct event types (avoids HTML drag event mismatch)
export type MotionCardProps = React.ComponentPropsWithoutRef<typeof motion.div> & { children: React.ReactNode; delay?: number };

export function MotionCard({ children, className, delay = 0, ...props }: MotionCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.985, filter: "blur(8px)" }}
      animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      whileHover={reduce ? undefined : { y: -3, scale: 1.003 }}
      transition={{ duration: 0.42, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
