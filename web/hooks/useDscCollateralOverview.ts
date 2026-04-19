"use client";

import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";
import {
  formatTokenAmount,
  getUnitAmount,
  normalizeTokenDecimals,
} from "@/lib/protocol/tokenUnits";

type CollateralBalanceResult = bigint;

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

  const decimalsReadResult = useReadContracts({
    contracts:
      enabled && contracts
        ? [
            {
              address: contracts.weth as `0x${string}`,
              abi: erc20Abi,
              functionName: "decimals",
            },
            {
              address: contracts.wbtc as `0x${string}`,
              abi: erc20Abi,
              functionName: "decimals",
            },
          ]
        : [],
    query: {
      enabled,
    },
  });

  const [wethDecimalsResult, wbtcDecimalsResult] =
    decimalsReadResult.data ?? [];

  const wethDecimals =
    wethDecimalsResult?.status === "success"
      ? normalizeTokenDecimals(wethDecimalsResult.result as bigint)
      : 18;
  const wbtcDecimals =
    wbtcDecimalsResult?.status === "success"
      ? normalizeTokenDecimals(wbtcDecimalsResult.result as bigint)
      : 18;

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
              args: [contracts.weth as `0x${string}`, getUnitAmount(wethDecimals)],
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
              args: [contracts.wbtc as `0x${string}`, getUnitAmount(wbtcDecimals)],
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

    const wethUnitAmount = getUnitAmount(wethDecimals ?? 18);
    const wbtcUnitAmount = getUnitAmount(wbtcDecimals ?? 18);

    const wethUsdValue =
      wethDeposited !== undefined && wethUnitUsd !== undefined
        ? (wethDeposited * wethUnitUsd) / wethUnitAmount
        : undefined;

    const wbtcUsdValue =
      wbtcDeposited !== undefined && wbtcUnitUsd !== undefined
        ? (wbtcDeposited * wbtcUnitUsd) / wbtcUnitAmount
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
        wethDecimals,
        wbtcDecimals,
      },
      formatted: {
        wethDeposited: formatTokenAmount(wethDeposited, wethDecimals ?? 18),
        wethUsdValue: formatTokenAmount(wethUsdValue, 18),
        wbtcDeposited: formatTokenAmount(
          wbtcDeposited,
          wbtcDecimals ?? 18,
          6,
        ),
        wbtcUsdValue: formatTokenAmount(wbtcUsdValue, 18),
        totalCollateralUsd: formatTokenAmount(totalCollateralUsd, 18),
      },
    };
  }, [
    contracts?.weth,
    contracts?.wbtc,
    wethDecimals,
    wbtcDecimals,
    wethDepositedResult,
    wethUnitUsdResult,
    wbtcDepositedResult,
    wbtcUnitUsdResult,
    totalCollateralUsdResult,
  ]);

  const contractErrors = [
    wethDecimalsResult,
    wbtcDecimalsResult,
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
    isLoading: decimalsReadResult.isLoading || readResult.isLoading,
    isFetching: decimalsReadResult.isFetching || readResult.isFetching,
    isError:
      decimalsReadResult.isError ||
      readResult.isError ||
      contractErrors.length > 0,
    error:
      (contractErrors[0] as Error | null) ??
      decimalsReadResult.error ??
      readResult.error ??
      null,
    readResult: {
      refetch: async () => {
        await Promise.all([
          decimalsReadResult.refetch(),
          readResult.refetch(),
        ]);
      },
      decimals: decimalsReadResult,
      values: readResult,
    },
  };
}
