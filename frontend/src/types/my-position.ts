import type { Address } from "viem";

export type CollateralTokenSymbol = "WETH" | "WBTC";

export type CollateralPositionItem = {
  symbol: CollateralTokenSymbol;
  name: string;
  tokenAddress: Address | null;
  walletBalance?: bigint;
  depositedAmount?: bigint;
  allowance?: bigint;
  isAvailable: boolean;
};
