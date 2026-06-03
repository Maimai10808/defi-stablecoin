"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const listVariants: Variants = { initial: {}, animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const itemVariants: Variants = { initial: { opacity: 0, y: 12, filter: "blur(6px)" }, animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } } };

export type MotionRevealListProps = { children: React.ReactNode; className?: string };

export function MotionRevealList({ children, className }: MotionRevealListProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? undefined : listVariants} initial={reduce ? false : "initial"} animate={reduce ? undefined : "animate"} className={className}>
      {React.Children.map(children, (child, index) => <motion.div key={index} variants={itemVariants}>{child}</motion.div>)}
    </motion.div>
  );
}
