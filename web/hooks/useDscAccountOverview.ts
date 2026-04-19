"use client";

import { useMemo } from "react";
import { useAccount, useBalance, useReadContracts } from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscAbi, dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";
import {
  DSC_DECIMALS,
  formatTokenAmount,
  normalizeTokenDecimals,
} from "@/lib/protocol/tokenUnits";

type AccountInfoResult = readonly [bigint, bigint];

export function useDscAccountOverview() {
  const { address, isConnected, chainId } = useAccount();
  const { contracts, isSupportedChain } = useProtocolContracts();

  const enabled = Boolean(
    address &&
    isConnected &&
    isSupportedChain &&
    contracts?.dscEngine &&
    contracts?.dsc &&
    contracts?.weth &&
    contracts?.wbtc,
  );

  const protocolReadResult = useReadContracts({
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

  const walletTokenReadResult = useReadContracts({
    contracts:
      enabled && contracts
        ? [
            {
              address: contracts.weth as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address as `0x${string}`],
            },
            {
              address: contracts.wbtc as `0x${string}`,
              abi: erc20Abi,
              functionName: "balanceOf",
              args: [address as `0x${string}`],
            },
          ]
        : [],
    query: {
      enabled,
    },
  });

  const ethBalanceResult = useBalance({
    address: address as `0x${string}` | undefined,
    query: {
      enabled: Boolean(address && isConnected && isSupportedChain),
    },
  });

  const [
    healthFactorResult,
    accountInfoResult,
    dscBalanceResult,
    wethDecimalsResult,
    wbtcDecimalsResult,
  ] =
    protocolReadResult.data ?? [];

  const [wethBalanceResult, wbtcBalanceResult] =
    walletTokenReadResult.data ?? [];

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

    const rawWethBalance =
      wethBalanceResult?.status === "success"
        ? (wethBalanceResult.result as bigint)
        : undefined;

    const rawWbtcBalance =
      wbtcBalanceResult?.status === "success"
        ? (wbtcBalanceResult.result as bigint)
        : undefined;

    const rawEthBalance = ethBalanceResult.data?.value;
    const wethDecimals =
      wethDecimalsResult?.status === "success"
        ? normalizeTokenDecimals(wethDecimalsResult.result as bigint)
        : undefined;
    const wbtcDecimals =
      wbtcDecimalsResult?.status === "success"
        ? normalizeTokenDecimals(wbtcDecimalsResult.result as bigint)
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
        ethBalance: rawEthBalance,
        wethBalance: rawWethBalance,
        wbtcBalance: rawWbtcBalance,
        wethDecimals,
        wbtcDecimals,
      },
      formatted: {
        healthFactor: formatTokenAmount(rawHealthFactor, DSC_DECIMALS),
        totalDscMinted: formatTokenAmount(totalDscMinted, DSC_DECIMALS),
        collateralValueInUsd: formatTokenAmount(collateralValueInUsd, DSC_DECIMALS),
        dscBalance: formatTokenAmount(rawDscBalance, DSC_DECIMALS),
        ethBalance: formatTokenAmount(rawEthBalance, 18),
        wethBalance: formatTokenAmount(rawWethBalance, wethDecimals ?? 18),
        wbtcBalance: formatTokenAmount(rawWbtcBalance, wbtcDecimals ?? 18, 6),
      },
    };
  }, [
    address,
    healthFactorResult,
    accountInfoResult,
    dscBalanceResult,
    wethDecimalsResult,
    wbtcDecimalsResult,
    wethBalanceResult,
    wbtcBalanceResult,
    ethBalanceResult.data,
  ]);

  const contractErrors = [
    healthFactorResult,
    accountInfoResult,
    dscBalanceResult,
    wethDecimalsResult,
    wbtcDecimalsResult,
    wethBalanceResult,
    wbtcBalanceResult,
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
    isLoading:
      protocolReadResult.isLoading ||
      walletTokenReadResult.isLoading ||
      ethBalanceResult.isLoading,
    isFetching:
      protocolReadResult.isFetching ||
      walletTokenReadResult.isFetching ||
      ethBalanceResult.isFetching,
    isError:
      protocolReadResult.isError ||
      walletTokenReadResult.isError ||
      ethBalanceResult.isError ||
      contractErrors.length > 0,
    error:
      (contractErrors[0] as Error | null) ??
      protocolReadResult.error ??
      walletTokenReadResult.error ??
      ethBalanceResult.error ??
      null,
    readResult: {
      refetch: async () => {
        await Promise.all([
          protocolReadResult.refetch(),
          walletTokenReadResult.refetch(),
          ethBalanceResult.refetch(),
        ]);
      },
      protocol: protocolReadResult,
      walletTokens: walletTokenReadResult,
      ethBalance: ethBalanceResult,
    },
  };
}
