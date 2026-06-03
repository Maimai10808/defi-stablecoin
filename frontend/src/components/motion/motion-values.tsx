"use client";

import { formatEther } from "viem";

import { MotionCountUp } from "@/components/motion/motion-countup";
import { MotionSkeleton } from "@/components/motion/motion-skeleton";

type MotionValueTextProps = {
  value?: bigint;
  fallback?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

export function MotionValueText({
  value,
  fallback = "Loading...",
  prefix,
  suffix,
  decimals = 2,
  className,
}: MotionValueTextProps) {
  if (value === undefined) {
    if (fallback === "Loading...") {
      return <MotionSkeleton className={className ?? "h-6 w-24"} />;
    }

    return <span className={className}>{fallback}</span>;
  }

  return (
    <MotionCountUp
      value={Number(formatEther(value))}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      className={className}
    />
  );
}

type MotionNumberTextProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
};

export function MotionNumberText({
  value,
  prefix,
  suffix,
  decimals = 2,
  className,
}: MotionNumberTextProps) {
  return (
    <MotionCountUp
      value={value}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      className={className}
    />
  );
}
