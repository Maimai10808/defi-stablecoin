"use client";

import * as React from "react";
import type { Address } from "viem";
import { parseEther } from "viem";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAccount, useChainId, usePublicClient, useSignTypedData } from "wagmi";

import {
  useReadDecentralizedStableCoinAllowance,
  useReadDecentralizedStableCoinBalanceOf,
  useReadDecentralizedStableCoinName,
  useReadDecentralizedStableCoinNonces,
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadDscEngineGetDscMintedAmount,
  useReadDscEngineGetUsdValue,
  useReadWbtcMockBalanceOf,
  useReadWethMockBalanceOf,
  useWriteDecentralizedStableCoinApprove,
  useWriteDscEngineBurnDsc,
  useWriteDscEngineRedeemCollateral,
  useWriteDscEngineRedeemCollateralForDsc,
  useWriteDscEngineRepayDscWithPermit,
} from "@/generated/wagmi";

import {
  DSC_ENGINE_ADDRESS,
  DECENTRALIZED_STABLE_COIN_ADDRESS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from "@/constants/contracts";

import { isAvailableAddress, toSafeAddress } from "@/lib/format";
import { getPermitDeadline, signErc20Permit } from "@/lib/permit";

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
  const t = useTranslations("Toast");
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const signTypedData = useSignTypedData();

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
  const dscName = useReadDecentralizedStableCoinName();
  const dscNonce = useReadDecentralizedStableCoinNonces({
    args: [userAddress],
    query: { enabled: hasWallet },
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
  const burnDsc = useWriteDscEngineBurnDsc();
  const redeemCollateral = useWriteDscEngineRedeemCollateral();
  const redeemCollateralForDsc = useWriteDscEngineRedeemCollateralForDsc();
  const repayDscWithPermit = useWriteDscEngineRepayDscWithPermit();

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

  const selectedCollateralUsdValue = useReadDscEngineGetUsdValue({
    args: [selectedTokenAddress, collateralAmountBigInt],
    query: {
      enabled: selectedToken?.isAvailable && collateralAmountBigInt > BigInt(0),
    },
  });

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
      toast.error(t("connectFirst"));
      return;
    }

    if (dscAmountToBurnBigInt <= BigInt(0)) {
      toast.error(t("invalidDsc"));
      return;
    }

    try {
      await approveDsc.writeContractAsync({
        args: [engineAddress, dscAmountToBurnBigInt],
      });

      toast.success(t("dscApproved"));
    } catch (error) {
      console.error(error);
      toast.error(t("approveDscFailed"));
    }
  }

  async function repayAndRedeem() {
    if (!hasWallet) {
      toast.error(t("connectFirst"));
      return;
    }

    if (!selectedToken?.isAvailable) {
      toast.error(t("addressUnavailable", { token: form.collateralToken }));
      return;
    }

    if (collateralAmountBigInt <= BigInt(0)) {
      toast.error(t("invalidCollateral"));
      return;
    }

    if (dscAmountToBurnBigInt <= BigInt(0)) {
      toast.error(t("invalidDsc"));
      return;
    }

    if (needsApproval) {
      toast.error(t("approveDscFirst"));
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

      toast.success(t("repayRedeemSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("repayRedeemFailed"));
    }
  }

  async function repayDsc() {
    if (!hasWallet) {
      toast.error(t("connectFirst"));
      return;
    }

    if (dscAmountToBurnBigInt <= BigInt(0)) {
      toast.error(t("invalidDsc"));
      return;
    }

    if (
      dscWalletBalance.data !== undefined &&
      dscAmountToBurnBigInt > dscWalletBalance.data
    ) {
      toast.error(t("insufficientDsc"));
      return;
    }

    if (
      dscMintedAmount.data !== undefined &&
      dscAmountToBurnBigInt > dscMintedAmount.data
    ) {
      toast.error(t("exceedsDebt"));
      return;
    }

    if (needsApproval) {
      toast.error(t("approveDscFirst"));
      return;
    }

    try {
      await burnDsc.writeContractAsync({
        args: [dscAmountToBurnBigInt],
      });

      await Promise.all([
        dscWalletBalance.refetch(),
        dscMintedAmount.refetch(),
        dscEngineAllowance.refetch(),
      ]);
      toast.success(t("repaySuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("repayFailed"));
    }
  }

  async function repayDscUsingPermit() {
    if (!hasWallet || !address) {
      toast.error(t("connectFirst"));
      return;
    }
    if (!dscName.data || dscNonce.data === undefined) {
      toast.error(t("permitUnavailable"));
      return;
    }
    if (dscAmountToBurnBigInt <= BigInt(0)) {
      toast.error(t("invalidDsc"));
      return;
    }
    if (
      dscWalletBalance.data !== undefined &&
      dscAmountToBurnBigInt > dscWalletBalance.data
    ) {
      toast.error(t("insufficientDsc"));
      return;
    }
    if (
      dscMintedAmount.data !== undefined &&
      dscAmountToBurnBigInt > dscMintedAmount.data
    ) {
      toast.error(t("exceedsDebt"));
      return;
    }

    const deadline = getPermitDeadline();
    let permit: Awaited<ReturnType<typeof signErc20Permit>>;
    try {
      permit = await signErc20Permit(
        {
          tokenName: dscName.data,
          chainId,
          tokenAddress: toSafeAddress(DECENTRALIZED_STABLE_COIN_ADDRESS),
          owner: address,
          spender: engineAddress,
          value: dscAmountToBurnBigInt,
          nonce: dscNonce.data,
          deadline,
        },
        signTypedData.signTypedDataAsync,
      );
    } catch (error) {
      console.error(error);
      toast.error(t("permitRejected"));
      return;
    }

    try {
      const hash = await repayDscWithPermit.writeContractAsync({
        args: [
          dscAmountToBurnBigInt,
          permit.deadline,
          permit.v,
          permit.r,
          permit.s,
        ],
      });
      await publicClient?.waitForTransactionReceipt({ hash });
      await Promise.all([dscWalletBalance.refetch(), dscMintedAmount.refetch()]);
      toast.success(t("permitRepaySuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("repayFailed"));
    }
  }

  async function redeemSelectedCollateral() {
    if (!hasWallet) {
      toast.error(t("connectFirst"));
      return;
    }

    if (!selectedToken?.isAvailable) {
      toast.error(t("addressUnavailable", { token: form.collateralToken }));
      return;
    }

    if (collateralAmountBigInt <= BigInt(0)) {
      toast.error(t("invalidCollateral"));
      return;
    }

    if (
      selectedToken.depositedAmount !== undefined &&
      collateralAmountBigInt > selectedToken.depositedAmount
    ) {
      toast.error(t("exceedsCollateral"));
      return;
    }

    try {
      await redeemCollateral.writeContractAsync({
        args: [selectedTokenAddress as Address, collateralAmountBigInt],
      });

      await Promise.all([
        wethDepositedAmount.refetch(),
        wbtcDepositedAmount.refetch(),
        wethWalletBalance.refetch(),
        wbtcWalletBalance.refetch(),
      ]);
      toast.success(t("redeemSuccess"));
    } catch (error) {
      console.error(error);
      toast.error(t("redeemFailed"));
    }
  }

  const hasReadError =
    dscWalletBalance.isError ||
    dscEngineAllowance.isError ||
    dscMintedAmount.isError ||
    wethWalletBalance.isError ||
    wbtcWalletBalance.isError ||
    wethDepositedAmount.isError ||
    wbtcDepositedAmount.isError ||
    selectedCollateralUsdValue.isError;

  const isApproving = approveDsc.isPending;
  const isRepaying = burnDsc.isPending || repayDscWithPermit.isPending;
  const isRedeeming =
    redeemCollateralForDsc.isPending || redeemCollateral.isPending;

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
      selectedCollateralUsdValue: selectedCollateralUsdValue.data,
    },
    status: {
      hasReadError,
      needsApproval,
      isApproving,
      isRepaying,
      isRedeeming,
      isSigningPermit: signTypedData.isPending,
      permitAvailable: Boolean(dscName.data) && dscNonce.data !== undefined,
      hasWeth,
      hasWbtc,
    },
    actions: {
      updateField,
      approveDscForEngine,
      repayDsc,
      repayDscUsingPermit,
      redeemSelectedCollateral,
      repayAndRedeem,
    },
  };
}
