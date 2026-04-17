"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscAbi, dscEngineAbi } from "@/lib/contracts/abi";

type AccountInfoResult = readonly [bigint, bigint];

function format18(value: bigint | undefined, digits = 4) {
  if (value === undefined) return null;
  return Number(formatUnits(value, 18)).toFixed(digits);
}

export function useDscAccountOverview() {
  const { address, isConnected, chainId } = useAccount();
  const { contracts, isSupportedChain } = useProtocolContracts();

  const enabled = Boolean(
    address &&
    isConnected &&
    isSupportedChain &&
    contracts?.dscEngine &&
    contracts?.dsc,
  );

  const readResult = useReadContracts({
    contracts:
      enabled && contracts
        ? [
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getHealthFactor",
              args: [address as `0x${string}`],
            },
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getAccountInformation",
              args: [address as `0x${string}`],
            },
            {
              address: contracts.dsc as `0x${string}`,
              abi: dscAbi,
              functionName: "balanceOf",
              args: [address as `0x${string}`],
            },
          ]
        : [],
    query: {
      enabled,
    },
  });

  const [healthFactorResult, accountInfoResult, dscBalanceResult] =
    readResult.data ?? [];

  const overview = useMemo(() => {
    const rawHealthFactor =
      healthFactorResult?.status === "success"
        ? (healthFactorResult.result as bigint)
        : undefined;

    const rawAccountInfo =
      accountInfoResult?.status === "success"
        ? (accountInfoResult.result as AccountInfoResult)
        : undefined;

    const rawDscBalance =
      dscBalanceResult?.status === "success"
        ? (dscBalanceResult.result as bigint)
        : undefined;

    const totalDscMinted = rawAccountInfo?.[0];
    const collateralValueInUsd = rawAccountInfo?.[1];

    return {
      address,
      raw: {
        healthFactor: rawHealthFactor,
        totalDscMinted,
        collateralValueInUsd,
        dscBalance: rawDscBalance,
      },
      formatted: {
        healthFactor: format18(rawHealthFactor),
        totalDscMinted: format18(totalDscMinted),
        collateralValueInUsd: format18(collateralValueInUsd),
        dscBalance: format18(rawDscBalance),
      },
    };
  }, [address, healthFactorResult, accountInfoResult, dscBalanceResult]);

  const contractErrors = [
    healthFactorResult,
    accountInfoResult,
    dscBalanceResult,
  ]
    .filter((item) => item?.status === "failure")
    .map((item) => item?.error)
    .filter(Boolean);

  return {
    address,
    chainId,
    isConnected,
    isSupportedChain,
    contracts,
    enabled,
    overview,
    isLoading: readResult.isLoading,
    isFetching: readResult.isFetching,
    isError: readResult.isError || contractErrors.length > 0,
    error: (contractErrors[0] as Error | null) ?? readResult.error ?? null,
    readResult,
  };
}
