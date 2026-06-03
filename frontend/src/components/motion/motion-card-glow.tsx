"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";

export type MotionCardGlowProps = { children: React.ReactNode; className?: string };

export function MotionCardGlow({ children, className }: MotionCardGlowProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(125, 211, 252, 0.16), transparent 42%)`;
  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) { const bounds = event.currentTarget.getBoundingClientRect(); mouseX.set(event.clientX - bounds.left); mouseY.set(event.clientY - bounds.top); }
  return <motion.div onMouseMove={handleMouseMove} style={{ background }} className={`relative rounded-xl border bg-muted/20 ${className ?? ""}`}>{children}</motion.div>;
}
