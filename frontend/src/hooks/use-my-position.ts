"use client";

import type { Address } from "viem";
import { useAccount, useChainId } from "wagmi";

import {
  useReadDecentralizedStableCoinBalanceOf,
  useReadDscEngineGetAccountCollateralValue,
  useReadDscEngineGetAccountInformation,
  useReadDscEngineGetCollateralBalanceOfUser,
  useReadDscEngineGetDscMintedAmount,
  useReadDscEngineGetHealthFactor,
  useReadWbtcMockAllowance,
  useReadWbtcMockBalanceOf,
  useReadWethMockAllowance,
  useReadWethMockBalanceOf,
} from "@/generated/wagmi";

import {
  DSC_ENGINE_ADDRESS,
  WBTC_ADDRESS,
  WETH_ADDRESS,
} from "@/constants/contracts";

import type { CollateralPositionItem } from "@/types/my-position";
import { isAvailableAddress, toSafeAddress } from "@/lib/format";

export function useMyPosition(displayAddress?: Address) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isLocalDemo = chainId === 31337;

  const userAddress = displayAddress ?? toSafeAddress(address);
  const wethAddress = toSafeAddress(WETH_ADDRESS);
  const wbtcAddress = toSafeAddress(WBTC_ADDRESS);
  const dscEngineAddress = toSafeAddress(DSC_ENGINE_ADDRESS);

  const hasWallet = isConnected && Boolean(address);
  const shouldRead = hasWallet || (isLocalDemo && displayAddress !== undefined);
  const hasWeth = isAvailableAddress(WETH_ADDRESS);
  const hasWbtc = isAvailableAddress(WBTC_ADDRESS);

  const accountInformationRead = useReadDscEngineGetAccountInformation({
    args: [userAddress],
    query: {
      enabled: shouldRead,
    },
  });

  const accountCollateralValueRead = useReadDscEngineGetAccountCollateralValue({
    args: [userAddress],
    query: {
      enabled: shouldRead,
    },
  });

  const dscMintedAmountRead = useReadDscEngineGetDscMintedAmount({
    args: [userAddress],
    query: {
      enabled: shouldRead,
    },
  });

  const healthFactorRead = useReadDscEngineGetHealthFactor({
    args: [userAddress],
    query: {
      enabled: shouldRead,
    },
  });

  const dscWalletBalanceRead = useReadDecentralizedStableCoinBalanceOf({
    args: [userAddress],
    query: {
      enabled: shouldRead,
    },
  });

  const wethWalletBalanceRead = useReadWethMockBalanceOf({
    args: [userAddress],
    query: {
      enabled: shouldRead && hasWeth,
    },
  });

  const wbtcWalletBalanceRead = useReadWbtcMockBalanceOf({
    args: [userAddress],
    query: {
      enabled: shouldRead && hasWbtc,
    },
  });

  const wethDepositedAmountRead = useReadDscEngineGetCollateralBalanceOfUser({
    args: [userAddress, wethAddress],
    query: {
      enabled: shouldRead && hasWeth,
    },
  });

  const wbtcDepositedAmountRead = useReadDscEngineGetCollateralBalanceOfUser({
    args: [userAddress, wbtcAddress],
    query: {
      enabled: shouldRead && hasWbtc,
    },
  });

  const wethAllowanceRead = useReadWethMockAllowance({
    args: [userAddress, dscEngineAddress as Address],
    query: {
      enabled: shouldRead && hasWeth,
    },
  });

  const wbtcAllowanceRead = useReadWbtcMockAllowance({
    args: [userAddress, dscEngineAddress as Address],
    query: {
      enabled: shouldRead && hasWbtc,
    },
  });

  const collateralPositions: CollateralPositionItem[] = [
    {
      symbol: "WETH",
      name: "Wrapped Ether Mock",
      tokenAddress: hasWeth ? wethAddress : null,
      walletBalance: wethWalletBalanceRead.data,
      depositedAmount: wethDepositedAmountRead.data,
      allowance: wethAllowanceRead.data,
      isAvailable: hasWeth,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin Mock",
      tokenAddress: hasWbtc ? wbtcAddress : null,
      walletBalance: wbtcWalletBalanceRead.data,
      depositedAmount: wbtcDepositedAmountRead.data,
      allowance: wbtcAllowanceRead.data,
      isAvailable: hasWbtc,
    },
  ];

  const protocolReadable =
    accountInformationRead.isSuccess ||
    accountCollateralValueRead.isSuccess ||
    dscMintedAmountRead.isSuccess ||
    healthFactorRead.isSuccess ||
    dscWalletBalanceRead.isSuccess;

  const hasReadError =
    accountInformationRead.isError ||
    accountCollateralValueRead.isError ||
    dscMintedAmountRead.isError ||
    healthFactorRead.isError ||
    dscWalletBalanceRead.isError ||
    wethWalletBalanceRead.isError ||
    wbtcWalletBalanceRead.isError ||
    wethDepositedAmountRead.isError ||
    wbtcDepositedAmountRead.isError ||
    wethAllowanceRead.isError ||
    wbtcAllowanceRead.isError;

  const totalDscMintedFromAccount = accountInformationRead.data?.[0];
  const collateralValueFromAccount = accountInformationRead.data?.[1];

  return {
    wallet: {
      address,
      isConnected,
      hasWallet,
    },
    position: {
      totalDscMinted:
        dscMintedAmountRead.data ?? totalDscMintedFromAccount ?? undefined,
      collateralValueInUsd:
        accountCollateralValueRead.data ??
        collateralValueFromAccount ??
        undefined,
      healthFactor: healthFactorRead.data,
      dscWalletBalance: dscWalletBalanceRead.data,
      collateralPositions,
    },
    status: {
      protocolReadable,
      hasReadError,
    },
  };
}
