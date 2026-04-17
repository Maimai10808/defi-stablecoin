"use client";

import { useMemo } from "react";
import { useChainId } from "wagmi";
import { CONTRACT_ADDRESSES } from "../lib/contracts/addresses";

export function useProtocolContracts() {
  const chainId = useChainId();

  const contracts = useMemo(() => {
    if (!chainId) return null;
    return (
      CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES] ?? null
    );
  }, [chainId]);

  return {
    chainId,
    contracts,
    isSupportedChain: !!contracts,
  };
}
