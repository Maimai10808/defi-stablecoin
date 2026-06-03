"use client";

import * as React from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

export type MotionCountUpProps = { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string; duration?: number; locale?: string };

export function MotionCountUp({ value, prefix = "", suffix = "", decimals = 2, className, duration = 0.9, locale }: MotionCountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (latest) => `${prefix}${latest.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`);
  React.useEffect(() => {
    if (!inView) return;
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return controls.stop;
  }, [duration, inView, motionValue, reduce, value]);
  return <motion.span ref={ref} className={className}>{text}</motion.span>;
}
