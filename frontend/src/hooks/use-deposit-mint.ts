"use client";

import * as React from "react";
import type { Address } from "viem";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import {
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadWbtcMockAllowance,
  useReadWbtcMockBalanceOf,
  useReadWethMockAllowance,
  useReadWethMockBalanceOf,
  useWriteDscEngineDepositCollateralAndMintDsc,
  useWriteWbtcMockApprove,
  useWriteWethMockApprove,
} from "@/generated/wagmi";

import {
  DSC_ENGINE_ADDRESS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from "@/constants/contracts";

import { isAvailableAddress, toSafeAddress } from "@/lib/format";

import type {
  DepositMintFormState,
  DepositMintTokenItem,
} from "@/types/deposit-mint";

const DEFAULT_FORM: DepositMintFormState = {
  collateralToken: "WETH",
  collateralAmount: "1",
  dscAmountToMint: "500",
};

export function useDepositMint() {
  const { address, isConnected } = useAccount();

  const [form, setForm] = React.useState<DepositMintFormState>(DEFAULT_FORM);

  const userAddress = toSafeAddress(address);
  const engineAddress = toSafeAddress(DSC_ENGINE_ADDRESS);
  const wethAddress = toSafeAddress(WETH_ADDRESS);
  const wbtcAddress = toSafeAddress(WBTC_ADDRESS);

  const hasWallet = isConnected && Boolean(address);
  const hasWeth = isAvailableAddress(WETH_ADDRESS);
  const hasWbtc = isAvailableAddress(WBTC_ADDRESS);

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

  const wethAllowance = useReadWethMockAllowance({
    args: [userAddress, engineAddress],
    query: {
      enabled: hasWallet && hasWeth,
    },
  });

  const wbtcAllowance = useReadWbtcMockAllowance({
    args: [userAddress, engineAddress],
    query: {
      enabled: hasWallet && hasWbtc,
    },
  });

  const wethApprove = useWriteWethMockApprove();
  const wbtcApprove = useWriteWbtcMockApprove();
  const depositAndMint = useWriteDscEngineDepositCollateralAndMintDsc();

  const tokens: DepositMintTokenItem[] = [
    {
      symbol: "WETH",
      name: "Wrapped Ether Mock",
      tokenAddress: hasWeth ? WETH_ADDRESS : null,
      walletBalance: wethWalletBalance.data,
      depositedAmount: wethDepositedAmount.data,
      allowance: wethAllowance.data,
      isAvailable: hasWeth,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin Mock",
      tokenAddress: hasWbtc ? WBTC_ADDRESS : null,
      walletBalance: wbtcWalletBalance.data,
      depositedAmount: wbtcDepositedAmount.data,
      allowance: wbtcAllowance.data,
      isAvailable: hasWbtc,
    },
  ];

  const selectedToken = tokens.find(
    (token) => token.symbol === form.collateralToken,
  );

  const selectedTokenAddress =
    form.collateralToken === "WETH" ? wethAddress : wbtcAddress;

  const selectedAllowance =
    form.collateralToken === "WETH" ? wethAllowance.data : wbtcAllowance.data;

  const collateralAmountBigInt =
    form.collateralAmount && Number(form.collateralAmount) > 0
      ? parseEther(form.collateralAmount)
      : BigInt(0);

  const dscAmountToMintBigInt =
    form.dscAmountToMint && Number(form.dscAmountToMint) > 0
      ? parseEther(form.dscAmountToMint)
      : BigInt(0);

  const needsApproval =
    collateralAmountBigInt > BigInt(0) &&
    selectedAllowance !== undefined &&
    selectedAllowance < collateralAmountBigInt;

  function updateField<TField extends keyof DepositMintFormState>(
    field: TField,
    value: DepositMintFormState[TField],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function approveSelectedToken() {
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

    try {
      if (form.collateralToken === "WETH") {
        await wethApprove.writeContractAsync({
          args: [engineAddress, collateralAmountBigInt],
        });
      }

      if (form.collateralToken === "WBTC") {
        await wbtcApprove.writeContractAsync({
          args: [engineAddress, collateralAmountBigInt],
        });
      }

      toast.success(`${form.collateralToken} approved`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to approve ${form.collateralToken}`);
    }
  }

  async function depositCollateralAndMintDsc() {
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

    if (dscAmountToMintBigInt <= BigInt(0)) {
      toast.error("Please enter a valid DSC amount");
      return;
    }

    if (needsApproval) {
      toast.error("Please approve collateral first");
      return;
    }

    try {
      await depositAndMint.writeContractAsync({
        args: [
          selectedTokenAddress as Address,
          collateralAmountBigInt,
          dscAmountToMintBigInt,
        ],
      });

      toast.success("Collateral deposited and DSC minted");
    } catch (error) {
      console.error(error);
      toast.error("Deposit & mint failed");
    }
  }

  const hasReadError =
    wethWalletBalance.isError ||
    wbtcWalletBalance.isError ||
    wethDepositedAmount.isError ||
    wbtcDepositedAmount.isError ||
    wethAllowance.isError ||
    wbtcAllowance.isError;

  const isApproving = wethApprove.isPending || wbtcApprove.isPending;
  const isDepositing = depositAndMint.isPending;

  return {
    wallet: {
      address,
      isConnected,
      hasWallet,
    },
    form,
    tokens,
    selectedToken,
    selectedAllowance,
    status: {
      hasReadError,
      isApproving,
      isDepositing,
      needsApproval,
      hasWeth,
      hasWbtc,
    },
    actions: {
      updateField,
      approveSelectedToken,
      depositCollateralAndMintDsc,
    },
  };
}
