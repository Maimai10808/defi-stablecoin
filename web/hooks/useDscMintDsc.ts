"use client";

import { useCallback, useMemo, useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscEngineAbi } from "@/lib/contracts/abi";

type MintFormState = {
  amount: string;
};

function parseMintAmount(amount: string): bigint | null {
  const trimmed = amount.trim();

  if (!trimmed) return null;

  try {
    const parsed = parseUnits(trimmed, 18);
    if (parsed <= BigInt(0)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useDscMintDsc() {
  const { address, isConnected, chainId } = useAccount();
  const { contracts, isSupportedChain } = useProtocolContracts();

  const [form, setForm] = useState<MintFormState>({
    amount: "",
  });

  const parsedAmount = useMemo(
    () => parseMintAmount(form.amount),
    [form.amount],
  );

  const enabled = Boolean(
    address && isConnected && isSupportedChain && contracts?.dscEngine,
  );

  const {
    data: hash,
    error: writeError,
    isPending: isWritePending,
    writeContractAsync,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const setAmount = useCallback((amount: string) => {
    setForm({ amount });
  }, []);

  const mint = useCallback(async () => {
    if (!enabled || !contracts?.dscEngine || !parsedAmount) return;

    await writeContractAsync({
      address: contracts.dscEngine as `0x${string}`,
      abi: dscEngineAbi,
      functionName: "mintDsc",
      args: [parsedAmount],
    });
  }, [enabled, contracts, parsedAmount, writeContractAsync]);

  const clear = useCallback(() => {
    setForm({ amount: "" });
    reset();
  }, [reset]);

  const validationMessage = useMemo(() => {
    if (!isConnected) return "Wallet not connected.";
    if (!isSupportedChain) return "Unsupported chain.";
    if (!contracts?.dscEngine) return "DSCEngine contract is missing.";
    if (!form.amount.trim()) return "Enter a DSC amount.";
    if (!parsedAmount) return "Enter a valid amount greater than 0.";
    return null;
  }, [isConnected, isSupportedChain, contracts, form.amount, parsedAmount]);

  return {
    address,
    chainId,
    isConnected,
    isSupportedChain,
    contracts,
    enabled,

    amount: form.amount,
    parsedAmount,
    setAmount,
    clear,
    mint,

    canMint: enabled && !!parsedAmount && !isWritePending && !isConfirming,

    txHash: hash,
    isWritePending,
    isConfirming,
    isConfirmed,

    isError: Boolean(writeError || receiptError),
    error: writeError ?? receiptError ?? null,

    validationMessage,
  };
}
