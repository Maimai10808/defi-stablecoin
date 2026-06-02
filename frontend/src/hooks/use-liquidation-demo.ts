"use client";

import * as React from "react";
import type { Address } from "viem";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import {
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadDscEngineGetHealthFactor,
  useReadDscEngineGetTokenAmountFromUsd,
  useSimulateDscEngineLiquidate,
  useWriteDscEngineLiquidate,
} from "@/generated/wagmi";

import { WBTC_ADDRESS, WETH_ADDRESS } from "@/constants/contracts";
import { isAvailableAddress, toSafeAddress } from "@/lib/format";

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

export function useLiquidationDemo() {
  const { address, isConnected } = useAccount();

  const [form, setForm] = React.useState<LiquidationTargetState>({
    userToLiquidate: "",
    collateralSymbol: "WETH",
    debtToCover: "",
  });

  const collateralAddress = getCollateralAddress(form.collateralSymbol);
  const collateralToken = toSafeAddress(collateralAddress);

  const targetAddress =
    form.userToLiquidate && isAddressLike(form.userToLiquidate)
      ? form.userToLiquidate
      : ZERO_ADDRESS;

  const debtToCoverInWei =
    form.debtToCover && Number(form.debtToCover) > 0
      ? parseEther(form.debtToCover)
      : BigInt(0);

  const hasWallet = isConnected && Boolean(address);
  const hasTarget = isAddressLike(form.userToLiquidate);
  const hasDebtToCover = debtToCoverInWei > BigInt(0);
  const hasCollateralToken = isAvailableAddress(collateralAddress);

  const canPrepareLiquidation =
    hasWallet && hasTarget && hasDebtToCover && hasCollateralToken;

  const targetHealthFactor = useReadDscEngineGetHealthFactor({
    args: [targetAddress],
    query: {
      enabled: hasTarget,
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

  const liquidationAction = useWriteDscEngineLiquidate();

  const hasReadError =
    targetHealthFactor.isError ||
    targetCollateralBalance.isError ||
    collateralNeeded.isError ||
    liquidationPreview.isError;

  const isReading =
    targetHealthFactor.isLoading ||
    targetCollateralBalance.isLoading ||
    collateralNeeded.isLoading ||
    liquidationPreview.isLoading;

  function updateField<K extends keyof LiquidationTargetState>(
    key: K,
    value: LiquidationTargetState[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function liquidate() {
    if (!canPrepareLiquidation) {
      toast.error("Please connect wallet and complete liquidation inputs");
      return;
    }

    if (!liquidationPreview.data?.request) {
      toast.error("Liquidation is not ready. Please check the target position");
      return;
    }

    try {
      await liquidationAction.writeContractAsync(
        liquidationPreview.data.request,
      );
      toast.success("Liquidation transaction submitted");
    } catch {
      toast.error("Liquidation transaction failed");
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
      targetCollateralBalance: targetCollateralBalance.data,
      collateralNeeded: collateralNeeded.data,
      canPrepareLiquidation,
      canSubmit: Boolean(liquidationPreview.data?.request),
      isSubmitting: liquidationAction.isPending,
      liquidate,
    },
    status: {
      isReading,
      hasReadError,
      previewError: liquidationPreview.error,
    },
  };
}
