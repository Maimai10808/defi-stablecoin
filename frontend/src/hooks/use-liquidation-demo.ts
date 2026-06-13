"use client";

import * as React from "react";
import type { Address } from "viem";
import { formatEther, parseEther } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  useReadDecentralizedStableCoinAllowance,
  useReadDecentralizedStableCoinBalanceOf,
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadDscEngineGetDscMintedAmount,
  useReadDscEngineGetHealthFactor,
  useReadDscEngineGetTokenAmountFromUsd,
  useSimulateDscEngineLiquidate,
  useWriteDecentralizedStableCoinApprove,
  useWriteDscEngineLiquidate,
} from "@/generated/wagmi";

import {
  DSC_ENGINE_ADDRESS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from "@/constants/contracts";
import { useActivityLog } from "@/hooks/use-activity-log";
import { isAvailableAddress, toSafeAddress } from "@/lib/format";
import {
  getDscApprovalErrorMessage,
  getLiquidationErrorMessage,
} from "@/lib/liquidation";

import type {
  LiquidationCollateralSymbol,
  LiquidationTargetState,
} from "@/types/liquidation-demo";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

function getCollateralAddress(symbol: LiquidationCollateralSymbol) {
  if (symbol === "WBTC") return WBTC_ADDRESS;
  return WETH_ADDRESS;
}

function isAddressLike(value: string): value is Address {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function parseDebtToCover(value: string) {
  if (!value || Number(value) <= 0) return BigInt(0);

  try {
    return parseEther(value);
  } catch {
    return BigInt(0);
  }
}

export function useLiquidationDemo() {
  const t = useTranslations("Toast");
  const tActivity = useTranslations("ActivityLog");
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const { addFailedLog, addSuccessLog } = useActivityLog();

  const [form, setForm] = React.useState<LiquidationTargetState>({
    userToLiquidate: "",
    collateralSymbol: "WETH",
    debtToCover: "",
  });

  const collateralAddress = getCollateralAddress(form.collateralSymbol);
  const collateralToken = toSafeAddress(collateralAddress);
  const engineAddress = toSafeAddress(DSC_ENGINE_ADDRESS);
  const liquidatorAddress = toSafeAddress(address);

  const targetAddress =
    form.userToLiquidate && isAddressLike(form.userToLiquidate)
      ? form.userToLiquidate
      : ZERO_ADDRESS;

  const debtToCoverInWei = parseDebtToCover(form.debtToCover);

  const hasWallet = isConnected && Boolean(address);
  const hasTarget = isAddressLike(form.userToLiquidate);
  const hasDebtToCover = debtToCoverInWei > BigInt(0);
  const hasCollateralToken = isAvailableAddress(collateralAddress);
  const isSelfLiquidation =
    hasWallet &&
    hasTarget &&
    address?.toLowerCase() === form.userToLiquidate.toLowerCase();

  const canPrepareLiquidation =
    hasWallet && hasTarget && hasDebtToCover && hasCollateralToken;

  const targetHealthFactor = useReadDscEngineGetHealthFactor({
    args: [targetAddress],
    query: {
      enabled: hasTarget,
    },
  });

  const liquidatorDscBalance = useReadDecentralizedStableCoinBalanceOf({
    args: [liquidatorAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const targetDscDebt = useReadDscEngineGetDscMintedAmount({
    args: [targetAddress],
    query: {
      enabled: hasTarget,
    },
  });

  const liquidatorHealthFactor = useReadDscEngineGetHealthFactor({
    args: [liquidatorAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const liquidatorDscDebt = useReadDscEngineGetDscMintedAmount({
    args: [liquidatorAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const liquidatorDscAllowance = useReadDecentralizedStableCoinAllowance({
    args: [liquidatorAddress, engineAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const targetCollateralBalance = useReadDscEngineGetCollateralBalanceOfUser({
    args: [targetAddress, collateralToken],
    query: {
      enabled: hasTarget && hasCollateralToken,
    },
  });

  const collateralNeeded = useReadDscEngineGetTokenAmountFromUsd({
    args: [collateralToken, debtToCoverInWei],
    query: {
      enabled: hasCollateralToken && hasDebtToCover,
    },
  });

  const liquidationPreview = useSimulateDscEngineLiquidate({
    args: [collateralToken, targetAddress, debtToCoverInWei],
    query: {
      enabled: canPrepareLiquidation,
    },
  });

  const approveAction = useWriteDecentralizedStableCoinApprove();
  const liquidationAction = useWriteDscEngineLiquidate();

  const targetHealthFactorValue =
    targetHealthFactor.data === undefined
      ? undefined
      : Number(formatEther(targetHealthFactor.data));
  const liquidatorHealthFactorValue =
    liquidatorHealthFactor.data === undefined
      ? undefined
      : Number(formatEther(liquidatorHealthFactor.data));
  const isTargetLiquidatable =
    targetHealthFactorValue !== undefined &&
    targetHealthFactorValue < 1 &&
    targetDscDebt.data !== undefined &&
    targetDscDebt.data > BigInt(0);
  const hasEnoughLiquidatorDsc =
    liquidatorDscBalance.data !== undefined &&
    liquidatorDscBalance.data >= debtToCoverInWei;
  const debtExceedsTarget =
    targetDscDebt.data !== undefined && debtToCoverInWei > targetDscDebt.data;
  const needsDscApproval =
    hasDebtToCover &&
    liquidatorDscAllowance.data !== undefined &&
    liquidatorDscAllowance.data < debtToCoverInWei;
  const hasEnoughDscAllowance =
    liquidatorDscAllowance.data !== undefined &&
    liquidatorDscAllowance.data >= debtToCoverInWei;
  const isLiquidatorHealthy =
    liquidatorDscDebt.data === BigInt(0) ||
    (liquidatorDscDebt.data !== undefined &&
      liquidatorHealthFactorValue !== undefined &&
      liquidatorHealthFactorValue >= 1);
  const canApprove =
    canPrepareLiquidation &&
    hasEnoughLiquidatorDsc &&
    needsDscApproval;
  const canLiquidate =
    canPrepareLiquidation &&
    !isSelfLiquidation &&
    isTargetLiquidatable &&
    hasEnoughLiquidatorDsc &&
    !debtExceedsTarget &&
    hasEnoughDscAllowance &&
    isLiquidatorHealthy;

  const hasReadError =
    targetHealthFactor.isError ||
    targetDscDebt.isError ||
    targetCollateralBalance.isError ||
    collateralNeeded.isError ||
    liquidatorDscBalance.isError ||
    liquidatorHealthFactor.isError ||
    liquidatorDscDebt.isError ||
    liquidatorDscAllowance.isError;

  const isReading =
    targetHealthFactor.isLoading ||
    targetDscDebt.isLoading ||
    targetCollateralBalance.isLoading ||
    collateralNeeded.isLoading ||
    liquidatorDscBalance.isLoading ||
    liquidatorHealthFactor.isLoading ||
    liquidatorDscDebt.isLoading ||
    liquidatorDscAllowance.isLoading;

  function updateField<K extends keyof LiquidationTargetState>(
    key: K,
    value: LiquidationTargetState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function refresh() {
    await Promise.all([
      targetHealthFactor.refetch(),
      targetDscDebt.refetch(),
      targetCollateralBalance.refetch(),
      collateralNeeded.refetch(),
      liquidatorDscBalance.refetch(),
      liquidatorHealthFactor.refetch(),
      liquidatorDscDebt.refetch(),
      liquidatorDscAllowance.refetch(),
      liquidationPreview.refetch(),
    ]);
  }

  async function approveDsc() {
    if (!canApprove) {
      toast.error(t("liquidationApprovalNotReady"));
      return;
    }

    try {
      const hash = await approveAction.writeContractAsync({
        args: [engineAddress, debtToCoverInWei],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      if (receipt?.status === "reverted") {
        throw new Error("DSC approval transaction reverted");
      }
      await Promise.all([
        liquidatorDscAllowance.refetch(),
        queryClient.invalidateQueries(),
      ]);
      addSuccessLog({
        type: "approve",
        title: tActivity("dscApprovedTitle"),
        description: tActivity("dscApprovedDescription", { amount: form.debtToCover }),
        txHash: hash,
        account: address,
      });
      toast.success(t("liquidationApprovalReady"));
    } catch (error) {
      const message = getDscApprovalErrorMessage(error);
      addFailedLog({
        type: "approve",
        title: tActivity("dscApprovalFailed"),
        description: message,
        account: address,
      });
      toast.error(message);
    }
  }

  async function liquidate() {
    if (!canLiquidate) {
      if (isSelfLiquidation) {
        toast.error(t("switchLiquidator"));
      } else if (!isTargetLiquidatable) {
        toast.error(t("targetHealthy"));
      } else if (debtExceedsTarget) {
        toast.error(t("targetDebtExceeded"));
      } else if (!hasEnoughLiquidatorDsc) {
        toast.error(t("liquidatorDscInsufficient"));
      } else if (needsDscApproval) {
        toast.error(t("approveEnoughDsc"));
      } else if (!isLiquidatorHealthy) {
        toast.error(t("liquidatorUnsafe"));
      } else {
        toast.error(t("completeLiquidation"));
      }
      return;
    }

    try {
      const hash = await liquidationAction.writeContractAsync({
        args: [collateralToken, targetAddress, debtToCoverInWei],
      });
      const receipt = await publicClient?.waitForTransactionReceipt({ hash });
      if (receipt?.status === "reverted") {
        throw new Error("Liquidation transaction reverted");
      }
      await Promise.all([refresh(), queryClient.invalidateQueries()]);
      addSuccessLog({
        type: "liquidation",
        title: tActivity("liquidationExecuted"),
        description: tActivity("liquidationDescription", {
          amount: form.debtToCover,
          account: form.userToLiquidate,
        }),
        txHash: hash,
        account: address,
      });
      toast.success(t("liquidationSuccess"));
    } catch (error) {
      const message = getLiquidationErrorMessage(error);
      addFailedLog({
        type: "liquidation",
        title: tActivity("liquidationFailed"),
        description: message,
        account: address,
      });
      toast.error(message);
    }
  }

  return {
    wallet: {
      address,
      isConnected,
      hasWallet,
    },
    form,
    updateField,
    liquidation: {
      collateralAddress,
      collateralToken,
      targetAddress,
      debtToCoverInWei,
      targetHealthFactor: targetHealthFactor.data,
      targetDscDebt: targetDscDebt.data,
      targetCollateralBalance: targetCollateralBalance.data,
      collateralNeeded: collateralNeeded.data,
      liquidatorDscBalance: liquidatorDscBalance.data,
      liquidatorHealthFactor: liquidatorHealthFactor.data,
      liquidatorDscDebt: liquidatorDscDebt.data,
      liquidatorDscAllowance: liquidatorDscAllowance.data,
      isTargetAddressValid: hasTarget,
      isSelfLiquidation,
      isTargetLiquidatable,
      hasDebtToCover,
      hasEnoughLiquidatorDsc,
      debtExceedsTarget,
      needsDscApproval,
      hasEnoughDscAllowance,
      isLiquidatorHealthy,
      canApprove,
      canLiquidate,
      canPrepareLiquidation,
      canSubmit: canLiquidate,
      isApproving: approveAction.isPending,
      isSubmitting: liquidationAction.isPending,
      approveDsc,
      liquidate,
      refresh,
    },
    status: {
      isReading,
      hasReadError,
      previewError: liquidationPreview.error,
    },
  };
}
