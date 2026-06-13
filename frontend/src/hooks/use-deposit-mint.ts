"use client";

import * as React from "react";
import type { Address } from "viem";
import { parseEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import {useTranslations} from "next-intl";
import { useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";

import {
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadDscEngineGetUsdValue,
  useReadWbtcMockAllowance,
  useReadWbtcMockBalanceOf,
  useReadWethMockAllowance,
  useReadWethMockBalanceOf,
  useWriteDscEngineDepositCollateralAndMintDsc,
  useWriteDscEngineDepositCollateral,
  useWriteDscEngineMintDsc,
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
  const t = useTranslations("Toast");
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const [form, setForm] = React.useState<DepositMintFormState>(DEFAULT_FORM);
  const [isGuidedDepositPending, setIsGuidedDepositPending] =
    React.useState(false);

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
  const depositCollateral = useWriteDscEngineDepositCollateral();
  const mintDsc = useWriteDscEngineMintDsc();

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

  const selectedCollateralUsdValue = useReadDscEngineGetUsdValue({
    args: [selectedTokenAddress, collateralAmountBigInt],
    query: {
      enabled: selectedToken?.isAvailable && collateralAmountBigInt > BigInt(0),
    },
  });

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
      toast.error(t("connectFirst"));
      return;
    }

    if (!selectedToken?.isAvailable) {
      toast.error(t("addressUnavailable", {token: form.collateralToken}));
      return;
    }

    if (collateralAmountBigInt <= BigInt(0)) {
      toast.error(t("invalidCollateral"));
      return;
    }

    try {
      if (form.collateralToken === "WETH") {
        const hash = await wethApprove.writeContractAsync({
          args: [engineAddress, collateralAmountBigInt],
        });
        await publicClient?.waitForTransactionReceipt({ hash });
      }

      if (form.collateralToken === "WBTC") {
        const hash = await wbtcApprove.writeContractAsync({
          args: [engineAddress, collateralAmountBigInt],
        });
        await publicClient?.waitForTransactionReceipt({ hash });
      }

      await Promise.all([wethAllowance.refetch(), wbtcAllowance.refetch()]);
      toast.success(t("approved", {token: form.collateralToken}));
      return true;
    } catch (error) {
      console.error(error);
      toast.error(t("approveFailed", {token: form.collateralToken}));
      return false;
    }
  }

  async function depositCollateralAndMintDsc() {
    if (!hasWallet) {
      toast.error(t("connectFirst"));
      return;
    }

    if (!selectedToken?.isAvailable) {
      toast.error(t("addressUnavailable", {token: form.collateralToken}));
      return;
    }

    if (collateralAmountBigInt <= BigInt(0)) {
      toast.error(t("invalidCollateral"));
      return;
    }

    if (dscAmountToMintBigInt <= BigInt(0)) {
      toast.error(t("invalidDsc"));
      return;
    }

    if (needsApproval) {
      toast.error(t("approveFirst"));
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

      toast.success(t("depositMintSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("depositMintFailed"));
    }
  }

  async function depositSelectedCollateral(options?: { approvalConfirmed?: boolean }) {
    if (!hasWallet) {
      toast.error(t("connectFirst"));
      return;
    }

    if (!selectedToken?.isAvailable) {
      toast.error(t("addressUnavailable", {token: form.collateralToken}));
      return;
    }

    if (collateralAmountBigInt <= BigInt(0)) {
      toast.error(t("invalidCollateral"));
      return;
    }

    if (
      selectedToken.walletBalance !== undefined &&
      collateralAmountBigInt > selectedToken.walletBalance
    ) {
      toast.error(t("insufficient", {token: form.collateralToken}));
      return;
    }

    if (needsApproval && !options?.approvalConfirmed) {
      toast.error(t("approveFirst"));
      return;
    }

    try {
      const hash = await depositCollateral.writeContractAsync({
        args: [selectedTokenAddress as Address, collateralAmountBigInt],
      });
      await publicClient?.waitForTransactionReceipt({ hash });

      await Promise.all([
        wethWalletBalance.refetch(),
        wbtcWalletBalance.refetch(),
        wethDepositedAmount.refetch(),
        wbtcDepositedAmount.refetch(),
        queryClient.invalidateQueries(),
      ]);
      toast.success(t("depositSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("depositFailed"));
    }
  }

  async function approveAndDepositSelectedCollateral() {
    setIsGuidedDepositPending(true);

    try {
      if (needsApproval) {
        const approved = await approveSelectedToken();
        if (!approved) return;
      }

      await depositSelectedCollateral({ approvalConfirmed: needsApproval });
    } finally {
      setIsGuidedDepositPending(false);
    }
  }

  async function mintOnlyDsc() {
    if (!hasWallet) {
      toast.error(t("connectFirst"));
      return;
    }

    if (dscAmountToMintBigInt <= BigInt(0)) {
      toast.error(t("invalidDsc"));
      return;
    }

    try {
      const hash = await mintDsc.writeContractAsync({
        args: [dscAmountToMintBigInt],
      });
      await publicClient?.waitForTransactionReceipt({ hash });

      setForm((current) => ({ ...current, dscAmountToMint: "" }));
      await queryClient.invalidateQueries();
      toast.success(t("mintSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("mintFailed"));
    }
  }

  const hasReadError =
    wethWalletBalance.isError ||
    wbtcWalletBalance.isError ||
    wethDepositedAmount.isError ||
    wbtcDepositedAmount.isError ||
    wethAllowance.isError ||
    wbtcAllowance.isError ||
    selectedCollateralUsdValue.isError;

  const isApproving = wethApprove.isPending || wbtcApprove.isPending;
  const isDepositing =
    depositAndMint.isPending || depositCollateral.isPending;
  const isMinting = mintDsc.isPending;

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
    preview: {
      collateralAmountBigInt,
      collateralUsdValue: selectedCollateralUsdValue.data,
      dscAmountToMintBigInt,
    },
    status: {
      hasReadError,
      isApproving,
      isDepositing,
      isGuidedDepositPending,
      isMinting,
      needsApproval,
      hasWeth,
      hasWbtc,
    },
    actions: {
      updateField,
      approveSelectedToken,
      approveAndDepositSelectedCollateral,
      depositSelectedCollateral,
      mintOnlyDsc,
      depositCollateralAndMintDsc,
    },
  };
}
