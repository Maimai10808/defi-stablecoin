import type { Address } from "viem";

export type LiquidationCollateralSymbol = "WETH" | "WBTC";

export type LiquidationTargetState = {
  userToLiquidate: Address | "";
  collateralSymbol: LiquidationCollateralSymbol;
  debtToCover: string;
};
