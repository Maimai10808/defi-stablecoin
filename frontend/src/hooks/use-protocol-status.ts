"use client";

import { useAccount, useChainId } from "wagmi";

import {
  useReadDecentralizedStableCoinName,
  useReadDecentralizedStableCoinOwner,
  useReadDecentralizedStableCoinSymbol,
  useReadDecentralizedStableCoinTotalSupply,
  useReadDscEngineDsc,
  useReadDscEngineGetMinHealthFactor,
} from "@/generated/wagmi";

import {
  CHAIN_ID,
  DSC_ENGINE_ADDRESS,
  DECENTRALIZED_STABLE_COIN_ADDRESS,
  WETH_ADDRESS,
  WBTC_ADDRESS,
  ETH_USD_PRICE_FEED_ADDRESS,
  BTC_USD_PRICE_FEED_ADDRESS,
} from "@/constants/contracts";

import { isValidAddress } from "@/lib/format";

export function useProtocolStatus() {
  const { address, isConnected } = useAccount();
  const currentChainId = useChainId();

  const expectedChainId = Number(CHAIN_ID);
  const isCorrectNetwork = currentChainId === expectedChainId;

  const contractAddressesReady =
    isValidAddress(DSC_ENGINE_ADDRESS) &&
    isValidAddress(DECENTRALIZED_STABLE_COIN_ADDRESS) &&
    isValidAddress(WETH_ADDRESS);

  const dscFromEngine = useReadDscEngineDsc();
  const minHealthFactor = useReadDscEngineGetMinHealthFactor();

  const dscName = useReadDecentralizedStableCoinName();
  const dscSymbol = useReadDecentralizedStableCoinSymbol();
  const totalSupply = useReadDecentralizedStableCoinTotalSupply();
  const dscOwner = useReadDecentralizedStableCoinOwner();

  const protocolReadable =
    dscFromEngine.isSuccess &&
    minHealthFactor.isSuccess &&
    dscName.isSuccess &&
    dscSymbol.isSuccess &&
    totalSupply.isSuccess &&
    dscOwner.isSuccess;

  const hasProtocolReadError =
    dscFromEngine.isError ||
    minHealthFactor.isError ||
    dscName.isError ||
    dscSymbol.isError ||
    totalSupply.isError ||
    dscOwner.isError;

  const demoReady =
    isConnected &&
    isCorrectNetwork &&
    contractAddressesReady &&
    protocolReadable;

  return {
    wallet: {
      address,
      isConnected,
    },

    network: {
      currentChainId,
      expectedChainId,
      isCorrectNetwork,
    },

    addresses: {
      dscEngine: DSC_ENGINE_ADDRESS,
      decentralizedStableCoin: DECENTRALIZED_STABLE_COIN_ADDRESS,
      weth: WETH_ADDRESS,
      wbtc: WBTC_ADDRESS,
      ethUsdPriceFeed: ETH_USD_PRICE_FEED_ADDRESS,
      btcUsdPriceFeed: BTC_USD_PRICE_FEED_ADDRESS,
      contractAddressesReady,
    },

    protocolData: {
      dscFromEngine,
      minHealthFactor,
      dscName,
      dscSymbol,
      totalSupply,
      dscOwner,
    },

    status: {
      protocolReadable,
      hasProtocolReadError,
      demoReady,
    },
  };
}
