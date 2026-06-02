"use client";

import * as React from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";

import { useWriteWbtcMockMint, useWriteWethMockMint } from "@/generated/wagmi";

import { WBTC_ADDRESS, WETH_ADDRESS } from "@/constants/contracts";
import { isAvailableAddress, toSafeAddress } from "@/lib/format";

import type { FaucetTokenItem, FaucetTokenSymbol } from "@/types/faucet";

export function useFaucet() {
  const { address, isConnected } = useAccount();

  const [amounts, setAmounts] = React.useState<
    Record<FaucetTokenSymbol, string>
  >({
    WETH: "10",
    WBTC: "1",
  });

  const wethMint = useWriteWethMockMint();
  const wbtcMint = useWriteWbtcMockMint();

  const hasWallet = isConnected && Boolean(address);
  const hasWeth = isAvailableAddress(WETH_ADDRESS);
  const hasWbtc = isAvailableAddress(WBTC_ADDRESS);

  const tokens: FaucetTokenItem[] = [
    {
      symbol: "WETH",
      name: "Wrapped Ether Mock",
      description: "Mint local WETH test collateral to your wallet.",
      tokenAddress: hasWeth ? WETH_ADDRESS : null,
      defaultAmount: "10",
      isAvailable: hasWeth,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin Mock",
      description: "Mint local WBTC test collateral to your wallet.",
      tokenAddress: hasWbtc ? WBTC_ADDRESS : null,
      defaultAmount: "1",
      isAvailable: hasWbtc,
    },
  ];

  function updateAmount(symbol: FaucetTokenSymbol, value: string) {
    setAmounts((current) => ({
      ...current,
      [symbol]: value,
    }));
  }

  async function mintToken(symbol: FaucetTokenSymbol) {
    if (!hasWallet || !address) {
      toast.error("Please connect wallet first");
      return;
    }

    const rawAmount = amounts[symbol];

    if (!rawAmount || Number(rawAmount) <= 0) {
      toast.error("Please enter a valid mint amount");
      return;
    }

    const amount = parseEther(rawAmount);
    const recipient = toSafeAddress(address);

    try {
      if (symbol === "WETH") {
        if (!hasWeth) {
          toast.error("WETH address is not available");
          return;
        }

        await wethMint.writeContractAsync({
          args: [recipient, amount],
        });
      }

      if (symbol === "WBTC") {
        if (!hasWbtc) {
          toast.error("WBTC address is not available");
          return;
        }

        await wbtcMint.writeContractAsync({
          args: [recipient, amount],
        });
      }

      toast.success(`${rawAmount} ${symbol} minted`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to mint ${symbol}`);
    }
  }

  const isMinting = wethMint.isPending || wbtcMint.isPending;

  return {
    wallet: {
      address,
      isConnected,
      hasWallet,
    },
    tokens,
    amounts,
    status: {
      isMinting,
      hasWeth,
      hasWbtc,
    },
    actions: {
      updateAmount,
      mintToken,
    },
  };
}
