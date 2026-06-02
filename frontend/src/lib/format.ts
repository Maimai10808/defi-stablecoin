import type { Address } from "viem";
import { formatEther } from "viem";
import { toast } from "sonner";

export const ZERO_ADDRESS =
  "0x0000000000000000000000000000000000000000" as const;

export function shortAddress(address?: string | null) {
  if (!address) return "Not available";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatHealthFactor(value?: bigint) {
  if (value === undefined) return "Loading...";
  return Number(formatEther(value)).toFixed(2);
}

export function formatDscSupply(value?: bigint) {
  if (value === undefined) return "Loading...";
  return `${Number(formatEther(value)).toLocaleString()} DSC`;
}

export function formatTokenAmount(value?: bigint, symbol = "") {
  if (value === undefined) return "Loading...";

  return `${Number(formatEther(value)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })}${symbol ? ` ${symbol}` : ""}`;
}

export function formatUsdValue(value?: bigint) {
  if (value === undefined) return "Loading...";

  return `$${Number(formatEther(value)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export function toSafeAddress(address?: string | null): Address {
  if (!address) return ZERO_ADDRESS;
  return address as Address;
}

export function isAvailableAddress(address?: string | null) {
  return Boolean(address && address !== ZERO_ADDRESS);
}

export function isValidAddress(address?: string | null) {
  return isAvailableAddress(address);
}

export async function copyToClipboard(label: string, value?: string | null) {
  if (!value) {
    toast.error(`${label} address is not available`);
    return;
  }

  await navigator.clipboard.writeText(value);
  toast.success(`${label} copied`);
}
