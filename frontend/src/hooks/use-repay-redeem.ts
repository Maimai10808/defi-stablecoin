"use client";

import * as React from "react";
import type { Address } from "viem";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import {
  useReadDecentralizedStableCoinAllowance,
  useReadDecentralizedStableCoinBalanceOf,
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadDscEngineGetDscMintedAmount,
  useReadWbtcMockBalanceOf,
  useReadWethMockBalanceOf,
  useWriteDecentralizedStableCoinApprove,
  useWriteDscEngineRedeemCollateralForDsc,
} from "@/generated/wagmi";

import {
  DSC_ENGINE_ADDRESS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from "@/constants/contracts";

import { isAvailableAddress, toSafeAddress } from "@/lib/format";

import type {
  RepayRedeemFormState,
  RepayRedeemTokenItem,
} from "@/types/repay-redeem";

const DEFAULT_FORM: RepayRedeemFormState = {
  collateralToken: "WETH",
  collateralAmount: "0.5",
  dscAmountToBurn: "250",
};

export function useRepayRedeem() {
  const { address, isConnected } = useAccount();

  const [form, setForm] = React.useState<RepayRedeemFormState>(DEFAULT_FORM);

  const userAddress = toSafeAddress(address);
  const engineAddress = toSafeAddress(DSC_ENGINE_ADDRESS);
  const wethAddress = toSafeAddress(WETH_ADDRESS);
  const wbtcAddress = toSafeAddress(WBTC_ADDRESS);

  const hasWallet = isConnected && Boolean(address);
  const hasWeth = isAvailableAddress(WETH_ADDRESS);
  const hasWbtc = isAvailableAddress(WBTC_ADDRESS);

  const dscWalletBalance = useReadDecentralizedStableCoinBalanceOf({
    args: [userAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const dscEngineAllowance = useReadDecentralizedStableCoinAllowance({
    args: [userAddress, engineAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const dscMintedAmount = useReadDscEngineGetDscMintedAmount({
    args: [userAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const wethWalletBalance = useReadWethMockBalanceOf({
    args: [userAddress],
    query: {
      enabled: hasWallet && hasWeth,
    },
  });

  const wbtcWalletBalance = useReadWbtcMockBalanceOf({
    args: [userAddress],
    query: {
      enabled: hasWallet && hasWbtc,
    },
  });

  const wethDepositedAmount = useReadDscEngineGetCollateralBalanceOfUser({
    args: [userAddress, wethAddress],
    query: {
      enabled: hasWallet && hasWeth,
    },
  });

  const wbtcDepositedAmount = useReadDscEngineGetCollateralBalanceOfUser({
    args: [userAddress, wbtcAddress],
    query: {
      enabled: hasWallet && hasWbtc,
    },
  });

  const approveDsc = useWriteDecentralizedStableCoinApprove();
  const redeemCollateralForDsc = useWriteDscEngineRedeemCollateralForDsc();

  const tokens: RepayRedeemTokenItem[] = [
    {
      symbol: "WETH",
      name: "Wrapped Ether Mock",
      tokenAddress: hasWeth ? WETH_ADDRESS : null,
      walletBalance: wethWalletBalance.data,
      depositedAmount: wethDepositedAmount.data,
      isAvailable: hasWeth,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin Mock",
      tokenAddress: hasWbtc ? WBTC_ADDRESS : null,
      walletBalance: wbtcWalletBalance.data,
      depositedAmount: wbtcDepositedAmount.data,
      isAvailable: hasWbtc,
    },
  ];

  const selectedToken = tokens.find(
    (token) => token.symbol === form.collateralToken,
  );

  const selectedTokenAddress =
    form.collateralToken === "WETH" ? wethAddress : wbtcAddress;

  const collateralAmountBigInt =
    form.collateralAmount && Number(form.collateralAmount) > 0
      ? parseEther(form.collateralAmount)
      : BigInt(0);

  const dscAmountToBurnBigInt =
    form.dscAmountToBurn && Number(form.dscAmountToBurn) > 0
      ? parseEther(form.dscAmountToBurn)
      : BigInt(0);

  const needsApproval =
    dscAmountToBurnBigInt > BigInt(0) &&
    dscEngineAllowance.data !== undefined &&
    dscEngineAllowance.data < dscAmountToBurnBigInt;

  function updateField<TField extends keyof RepayRedeemFormState>(
    field: TField,
    value: RepayRedeemFormState[TField],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function approveDscForEngine() {
    if (!hasWallet) {
      toast.error("Please connect wallet first");
      return;
    }

    if (dscAmountToBurnBigInt <= BigInt(0)) {
      toast.error("Please enter a valid DSC amount");
      return;
    }

    try {
      await approveDsc.writeContractAsync({
        args: [engineAddress, dscAmountToBurnBigInt],
      });

      toast.success("DSC approved");
    } catch (error) {
      console.error(error);
      toast.error("Failed to approve DSC");
    }
  }

  async function repayAndRedeem() {
    if (!hasWallet) {
      toast.error("Please connect wallet first");
      return;
    }

    if (!selectedToken?.isAvailable) {
      toast.error(`${form.collateralToken} address is not available`);
      return;
    }

    if (collateralAmountBigInt <= BigInt(0)) {
      toast.error("Please enter a valid collateral amount");
      return;
    }

    if (dscAmountToBurnBigInt <= BigInt(0)) {
      toast.error("Please enter a valid DSC amount");
      return;
    }

    if (needsApproval) {
      toast.error("Please approve DSC first");
      return;
    }

    try {
      await redeemCollateralForDsc.writeContractAsync({
        args: [
          selectedTokenAddress as Address,
          collateralAmountBigInt,
          dscAmountToBurnBigInt,
        ],
      });

      toast.success("DSC repaid and collateral redeemed");
    } catch (error) {
      console.error(error);
      toast.error("Repay & redeem failed");
    }
  }

  const hasReadError =
    dscWalletBalance.isError ||
    dscEngineAllowance.isError ||
    dscMintedAmount.isError ||
    wethWalletBalance.isError ||
    wbtcWalletBalance.isError ||
    wethDepositedAmount.isError ||
    wbtcDepositedAmount.isError;

  const isApproving = approveDsc.isPending;
  const isRedeeming = redeemCollateralForDsc.isPending;

  return {
    wallet: {
      address,
      isConnected,
      hasWallet,
    },
    form,
    tokens,
    selectedToken,
    position: {
      dscWalletBalance: dscWalletBalance.data,
      dscEngineAllowance: dscEngineAllowance.data,
      dscMintedAmount: dscMintedAmount.data,
    },
    status: {
      hasReadError,
      needsApproval,
      isApproving,
      isRedeeming,
      hasWeth,
      hasWbtc,
    },
    actions: {
      updateField,
      approveDscForEngine,
      repayAndRedeem,
    },
  };
}
