"use client";

import { useCallback, useMemo, useState } from "react";
import { BaseError, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscAbi, dscEngineAbi } from "@/lib/contracts/abi";

type BurnStep =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "burning"
  | "burn-confirming"
  | "success"
  | "error";

type UseDscBurnDscOptions = {
  onSuccess?: () => Promise<void> | void;
};

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (error instanceof BaseError) return error.shortMessage || error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDscBurnDsc(options?: UseDscBurnDscOptions) {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { contracts, isSupportedChain } = useProtocolContracts();

  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<BurnStep>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const enabled = Boolean(
    address &&
    isConnected &&
    isSupportedChain &&
    contracts?.dsc &&
    contracts?.dscEngine &&
    publicClient,
  );

  const burnDsc = useCallback(
    async (amountInput: string) => {
      if (!enabled || !address || !contracts || !publicClient) {
        const nextError = new Error(
          "Wallet or contract configuration is not ready.",
        );
        setError(nextError);
        setStep("error");
        setStatusMessage(nextError.message);
        throw nextError;
      }

      try {
        setError(null);
        setTxHash(null);

        const amount = parseUnits(amountInput || "0", 18);
        if (amount <= BigInt(0)) {
          throw new Error("Amount must be greater than zero.");
        }

        setStep("approving");
        setStatusMessage("Submitting DSC approve transaction...");

        const approveHash = await writeContractAsync({
          address: contracts.dsc as `0x${string}`,
          abi: dscAbi,
          functionName: "approve",
          args: [contracts.dscEngine as `0x${string}`, amount],
        });

        setTxHash(approveHash);
        setStep("approve-confirming");
        setStatusMessage("Waiting for approve confirmation...");

        await publicClient.waitForTransactionReceipt({
          hash: approveHash,
        });

        setStep("burning");
        setStatusMessage("Submitting burn transaction...");

        const burnHash = await writeContractAsync({
          address: contracts.dscEngine as `0x${string}`,
          abi: dscEngineAbi,
          functionName: "burnDsc",
          args: [amount],
        });

        setTxHash(burnHash);
        setStep("burn-confirming");
        setStatusMessage("Waiting for burn confirmation...");

        await publicClient.waitForTransactionReceipt({
          hash: burnHash,
        });

        if (options?.onSuccess) {
          await options.onSuccess();
        }

        setStep("success");
        setStatusMessage("Burn transaction confirmed.");
        return burnHash;
      } catch (err) {
        const nextError =
          err instanceof Error ? err : new Error(getErrorMessage(err));

        setError(nextError);
        setStep("error");
        setStatusMessage(nextError.message);
        throw nextError;
      }
    },
    [enabled, address, contracts, publicClient, writeContractAsync, options],
  );

  const reset = useCallback(() => {
    setStep("idle");
    setStatusMessage("");
    setTxHash(null);
    setError(null);
  }, []);

  const isPending =
    step === "approving" ||
    step === "approve-confirming" ||
    step === "burning" ||
    step === "burn-confirming";

  const status = useMemo(
    () => ({
      step,
      message: statusMessage,
      txHash,
      isIdle: step === "idle",
      isPending,
      isSuccess: step === "success",
      isError: step === "error",
    }),
    [step, statusMessage, txHash, isPending],
  );

  return {
    address,
    chainId,
    isConnected,
    isSupportedChain,
    contracts,
    enabled,
    burnDsc,
    reset,
    status,
    error,
  };
}
