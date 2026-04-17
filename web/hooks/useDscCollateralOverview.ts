"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscEngineAbi } from "@/lib/contracts/abi";

type CollateralBalanceResult = bigint;

function format18(value: bigint | undefined, digits = 4) {
  if (value === undefined) return null;
  return Number(formatUnits(value, 18)).toFixed(digits);
}

export function useDscCollateralOverview() {
  const { address, isConnected, chainId } = useAccount();
  const { contracts, isSupportedChain } = useProtocolContracts();

  const enabled = Boolean(
    address &&
    isConnected &&
    isSupportedChain &&
    contracts?.dscEngine &&
    contracts?.weth &&
    contracts?.wbtc,
  );

  const readResult = useReadContracts({
    contracts:
      enabled && contracts
        ? [
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getCollateralBalanceOfUser",
              args: [address as `0x${string}`, contracts.weth as `0x${string}`],
            },
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getUsdValue",
              args: [contracts.weth as `0x${string}`, BigInt(1e18)],
            },
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getCollateralBalanceOfUser",
              args: [address as `0x${string}`, contracts.wbtc as `0x${string}`],
            },
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getUsdValue",
              args: [contracts.wbtc as `0x${string}`, BigInt(1e18)],
            },
            {
              address: contracts.dscEngine as `0x${string}`,
              abi: dscEngineAbi,
              functionName: "getAccountCollateralValue",
              args: [address as `0x${string}`],
            },
          ]
        : [],
    query: {
      enabled,
    },
  });

  const [
    wethDepositedResult,
    wethUnitUsdResult,
    wbtcDepositedResult,
    wbtcUnitUsdResult,
    totalCollateralUsdResult,
  ] = readResult.data ?? [];

  const overview = useMemo(() => {
    const wethDeposited =
      wethDepositedResult?.status === "success"
        ? (wethDepositedResult.result as CollateralBalanceResult)
        : undefined;

    const wbtcDeposited =
      wbtcDepositedResult?.status === "success"
        ? (wbtcDepositedResult.result as CollateralBalanceResult)
        : undefined;

    const wethUnitUsd =
      wethUnitUsdResult?.status === "success"
        ? (wethUnitUsdResult.result as bigint)
        : undefined;

    const wbtcUnitUsd =
      wbtcUnitUsdResult?.status === "success"
        ? (wbtcUnitUsdResult.result as bigint)
        : undefined;

    const totalCollateralUsd =
      totalCollateralUsdResult?.status === "success"
        ? (totalCollateralUsdResult.result as bigint)
        : undefined;

    const wethUsdValue =
      wethDeposited !== undefined && wethUnitUsd !== undefined
        ? (wethDeposited * wethUnitUsd) / BigInt(1e18)
        : undefined;

    const wbtcUsdValue =
      wbtcDeposited !== undefined && wbtcUnitUsd !== undefined
        ? (wbtcDeposited * wbtcUnitUsd) / BigInt(1e18)
        : undefined;

    return {
      tokens: {
        weth: contracts?.weth,
        wbtc: contracts?.wbtc,
      },
      raw: {
        wethDeposited,
        wethUsdValue,
        wbtcDeposited,
        wbtcUsdValue,
        totalCollateralUsd,
      },
      formatted: {
        wethDeposited: format18(wethDeposited),
        wethUsdValue: format18(wethUsdValue),
        wbtcDeposited: format18(wbtcDeposited),
        wbtcUsdValue: format18(wbtcUsdValue),
        totalCollateralUsd: format18(totalCollateralUsd),
      },
    };
  }, [
    contracts?.weth,
    contracts?.wbtc,
    wethDepositedResult,
    wethUnitUsdResult,
    wbtcDepositedResult,
    wbtcUnitUsdResult,
    totalCollateralUsdResult,
  ]);

  const contractErrors = [
    wethDepositedResult,
    wethUnitUsdResult,
    wbtcDepositedResult,
    wbtcUnitUsdResult,
    totalCollateralUsdResult,
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
