"use client";

import { useCallback, useMemo, useState } from "react";
import { parseUnits } from "viem";
import {
  useAccount,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";

type DepositStep = "idle" | "approving" | "depositing" | "success" | "error";

export function useDscDepositCollateral() {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { contracts, isSupportedChain } = useProtocolContracts();

  const [step, setStep] = useState<DepositStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync } = useWriteContract();

  const receiptQuery = useWaitForTransactionReceipt({
    hash: pendingHash,
    query: {
      enabled: Boolean(pendingHash),
    },
  });

  const enabled = Boolean(
    address &&
    chainId &&
    isConnected &&
    isSupportedChain &&
    contracts?.weth &&
    contracts?.dscEngine,
  );

  const approve = useCallback(
    async (amount: string) => {
      if (!enabled || !contracts?.weth || !contracts?.dscEngine) {
        throw new Error("Contracts not ready");
      }

      const parsedAmount = parseUnits(amount, 18);

      setError(null);
      setStep("approving");

      const hash = await writeContractAsync({
        address: contracts.weth as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [contracts.dscEngine as `0x${string}`, parsedAmount],
      });

      setPendingHash(hash);

      if (!publicClient) {
        throw new Error("Public client not ready");
      }

      await publicClient.waitForTransactionReceipt({ hash });
      setPendingHash(undefined);
      setStep("idle");
    },
    [enabled, contracts, publicClient, writeContractAsync],
  );

  const deposit = useCallback(
    async (amount: string) => {
      if (!enabled || !contracts?.weth || !contracts?.dscEngine) {
        throw new Error("Contracts not ready");
      }

      const parsedAmount = parseUnits(amount, 18);

      setError(null);
      setStep("depositing");

      const hash = await writeContractAsync({
        address: contracts.dscEngine as `0x${string}`,
        abi: dscEngineAbi,
        functionName: "depositCollateral",
        args: [contracts.weth as `0x${string}`, parsedAmount],
      });

      setPendingHash(hash);

      if (!publicClient) {
        throw new Error("Public client not ready");
      }

      await publicClient.waitForTransactionReceipt({ hash });
      setPendingHash(undefined);
      setStep("success");
    },
    [enabled, contracts, publicClient, writeContractAsync],
  );

  const approveAndDeposit = useCallback(
    async (amount: string) => {
      try {
        setStep("idle");
        setError(null);

        await approve(amount);
        await deposit(amount);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        setStep("error");
        setPendingHash(undefined);
        throw err;
      }
    },
    [approve, deposit],
  );

  const reset = useCallback(() => {
    setStep("idle");
    setError(null);
    setPendingHash(undefined);
  }, []);

  return useMemo(
    () => ({
      enabled,
      step,
      error,
      pendingHash,
      isPending:
        step === "approving" ||
        step === "depositing" ||
        receiptQuery.isLoading ||
        receiptQuery.isFetching,
      approve,
      deposit,
      approveAndDeposit,
      reset,
    }),
    [
      enabled,
      step,
      error,
      pendingHash,
      receiptQuery.isLoading,
      receiptQuery.isFetching,
      approve,
      deposit,
      approveAndDeposit,
      reset,
    ],
  );
}
