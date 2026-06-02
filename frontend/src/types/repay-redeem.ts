export type RepayRedeemTokenSymbol = "WETH" | "WBTC";

export type RepayRedeemTokenItem = {
  symbol: RepayRedeemTokenSymbol;
  name: string;
  tokenAddress: string | null;
  walletBalance?: bigint;
  depositedAmount?: bigint;
  isAvailable: boolean;
};

export type RepayRedeemFormState = {
  collateralToken: RepayRedeemTokenSymbol;
  collateralAmount: string;
  dscAmountToBurn: string;
};
