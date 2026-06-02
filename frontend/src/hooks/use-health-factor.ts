"use client";

import { useAccount } from "wagmi";

import {
  useReadDscEngineGetAccountCollateralValue,
  useReadDscEngineGetAccountInformation,
  useReadDscEngineGetDscMintedAmount,
  useReadDscEngineGetHealthFactor,
} from "@/generated/wagmi";

import { toSafeAddress } from "@/lib/format";

export function useHealthFactor() {
  const { address, isConnected } = useAccount();

  const userAddress = toSafeAddress(address);
  const hasWallet = isConnected && Boolean(address);

  const accountInformation = useReadDscEngineGetAccountInformation({
    args: [userAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const accountCollateralValue = useReadDscEngineGetAccountCollateralValue({
    args: [userAddress],
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

  const healthFactor = useReadDscEngineGetHealthFactor({
    args: [userAddress],
    query: {
      enabled: hasWallet,
    },
  });

  const totalDscMintedFromAccount = accountInformation.data?.[0];
  const collateralValueFromAccount = accountInformation.data?.[1];

  const hasReadError =
    accountInformation.isError ||
    accountCollateralValue.isError ||
    dscMintedAmount.isError ||
    healthFactor.isError;

  const isReading =
    accountInformation.isLoading ||
    accountCollateralValue.isLoading ||
    dscMintedAmount.isLoading ||
    healthFactor.isLoading;

  return {
    wallet: {
      address,
      isConnected,
      hasWallet,
    },
    risk: {
      healthFactor: healthFactor.data,
      collateralValueInUsd:
        accountCollateralValue.data ?? collateralValueFromAccount ?? undefined,
      totalDscMinted:
        dscMintedAmount.data ?? totalDscMintedFromAccount ?? undefined,
    },
    status: {
      isReading,
      hasReadError,
    },
  };
}
