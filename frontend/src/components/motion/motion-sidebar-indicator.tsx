"use client";

import * as React from "react";
import { motion } from "framer-motion";

export type MotionSidebarIndicatorProps = { active: boolean; children: React.ReactNode; className?: string };

export function MotionSidebarIndicator({ active, children, className }: MotionSidebarIndicatorProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      {active ? <motion.span layoutId="sidebar-active-indicator" className="absolute inset-y-1 left-0 w-1 rounded-full bg-primary" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
      <div className="pl-3">{children}</div>
    </div>
  );
}
