"use client";

import * as React from "react";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import {useTranslations} from "next-intl";

import { useWriteWbtcMockMint, useWriteWethMockMint } from "@/generated/wagmi";

import { WBTC_ADDRESS, WETH_ADDRESS } from "@/constants/contracts";
import { isAvailableAddress, toSafeAddress } from "@/lib/format";

import type { FaucetTokenItem, FaucetTokenSymbol } from "@/types/faucet";

export function useFaucet() {
  const t = useTranslations("Faucet");
  const tToast = useTranslations("Toast");
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
      description: t("wethDescription"),
      tokenAddress: hasWeth ? WETH_ADDRESS : null,
      defaultAmount: "10",
      isAvailable: hasWeth,
    },
    {
      symbol: "WBTC",
      name: "Wrapped Bitcoin Mock",
      description: t("wbtcDescription"),
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
      toast.error(tToast("connectFirst"));
      return;
    }

    const rawAmount = amounts[symbol];

    if (!rawAmount || Number(rawAmount) <= 0) {
      toast.error(t("invalidAmount"));
      return;
    }

    const amount = parseEther(rawAmount);
    const recipient = toSafeAddress(address);

    try {
      if (symbol === "WETH") {
        if (!hasWeth) {
          toast.error(tToast("addressUnavailable", {token: "WETH"}));
          return;
        }

        await wethMint.writeContractAsync({
          args: [recipient, amount],
        });
      }

      if (symbol === "WBTC") {
        if (!hasWbtc) {
          toast.error(tToast("addressUnavailable", {token: "WBTC"}));
          return;
        }

        await wbtcMint.writeContractAsync({
          args: [recipient, amount],
        });
      }

      toast.success(t("minted", {amount: rawAmount, token: symbol}));
    } catch (error) {
      console.error(error);
      toast.error(t("mintFailed", {token: symbol}));
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
