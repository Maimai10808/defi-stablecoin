import { formatEther } from "viem";

export const LIQUIDATION_THRESHOLD = 0.5;
export const MIN_HEALTH_FACTOR = 1;
export const LIQUIDATION_BONUS = 0.1;

export function bigintToNumber(value?: bigint) {
  return value === undefined ? 0 : Number(formatEther(value));
}

export function parsePositiveAmount(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export function estimateHealthFactor(collateralUsd: number, debtDsc: number) {
  if (debtDsc <= 0) return Number.POSITIVE_INFINITY;
  return (collateralUsd * LIQUIDATION_THRESHOLD) / debtDsc;
}

export function estimateMaxAdditionalMint(
  collateralUsd: number,
  currentDebtDsc: number,
) {
  return Math.max(collateralUsd * LIQUIDATION_THRESHOLD - currentDebtDsc, 0);
}

export function formatEstimatedHealthFactor(value: number) {
  return Number.isFinite(value) ? value.toFixed(2) : "No debt";
}

export function getRiskStatus(healthFactor?: bigint) {
  if (healthFactor === undefined) return "Loading";

  const value = bigintToNumber(healthFactor);
  if (value >= 2) return "Safe";
  if (value >= 1.2) return "Watch";
  if (value >= 1) return "Risky";
  return "Liquidatable";
}
