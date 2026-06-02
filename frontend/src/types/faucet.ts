export type FaucetTokenSymbol = "WETH" | "WBTC";

export type FaucetTokenItem = {
  symbol: FaucetTokenSymbol;
  name: string;
  description: string;
  tokenAddress: string | null;
  defaultAmount: string;
  isAvailable: boolean;
};
