"use client";

import * as React from "react";
import { motion, type Variants } from "framer-motion";

const rowVariants: Variants = {
  initial: { opacity: 0, x: -14, filter: "blur(5px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 12, filter: "blur(5px)", transition: { duration: 0.18 } },
};

export type MotionStreamRowProps = React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode };

export function MotionStreamRow({ children, className, ...props }: MotionStreamRowProps) {
  return (
    <motion.div layout variants={rowVariants} initial="initial" animate="animate" exit="exit" className={`relative overflow-hidden rounded-lg border bg-muted/20 ${className ?? ""}`} {...props}>
      <motion.span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-emerald-400" initial={{ opacity: 0 }} animate={{ opacity: [0.2, 0.8, 0.2] }} transition={{ duration: 1.6, repeat: Infinity }} />
      {children}
    </motion.div>
  );
}
