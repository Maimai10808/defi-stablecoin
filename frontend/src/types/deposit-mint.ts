export type DepositMintTokenSymbol = "WETH" | "WBTC";

export type DepositMintTokenItem = {
  symbol: DepositMintTokenSymbol;
  name: string;
  tokenAddress: string | null;
  walletBalance?: bigint;
  depositedAmount?: bigint;
  allowance?: bigint;
  isAvailable: boolean;
};

export type DepositMintFormState = {
  collateralToken: DepositMintTokenSymbol;
  collateralAmount: string;
  dscAmountToMint: string;
};
