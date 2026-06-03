"use client";

import * as React from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const pageVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.985, filter: "blur(8px)" },
  animate: {
    opacity: 1, y: 0, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.055, delayChildren: 0.04 },
  },
  exit: { opacity: 0, y: -10, scale: 0.99, filter: "blur(6px)", transition: { duration: 0.22 } },
};

export type MotionPageProps = { viewKey: string; children: React.ReactNode; className?: string };

export function MotionPage({ viewKey, children, className }: MotionPageProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={viewKey} variants={pageVariants} initial="initial" animate="animate" exit="exit" className={className}>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export const motionPageItem: Variants = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};
