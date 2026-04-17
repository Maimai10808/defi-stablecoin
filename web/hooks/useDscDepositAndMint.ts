"use client";

import { useCallback, useMemo, useState } from "react";
import { BaseError, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";
import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import {
  type CollateralSymbol,
  getAddressKeyForSymbol,
} from "@/lib/protocol/collateral";

type DepositAndMintStep =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "depositing-and-minting"
  | "deposit-mint-confirming"
  | "success"
  | "error";

type UseDscDepositAndMintOptions = {
  onSuccess?: () => Promise<void> | void;
};

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (error instanceof BaseError) return error.shortMessage || error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDscDepositAndMint(options?: UseDscDepositAndMintOptions) {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { contracts, isSupportedChain } = useProtocolContracts();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<DepositAndMintStep>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const enabled = Boolean(
    address &&
      isConnected &&
      isSupportedChain &&
      contracts?.dscEngine &&
      publicClient,
  );

  const depositAndMint = useCallback(
    async (
      collateralSymbol: CollateralSymbol,
      collateralAmountInput: string,
      mintAmountInput: string,
    ) => {
      const addressKey = getAddressKeyForSymbol(collateralSymbol);
      const collateralAddress = addressKey ? contracts?.[addressKey] : undefined;

      if (!enabled || !contracts || !publicClient || !collateralAddress) {
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

        const collateralAmount = parseUnits(collateralAmountInput || "0", 18);
        const mintAmount = parseUnits(mintAmountInput || "0", 18);

        if (collateralAmount <= BigInt(0) || mintAmount <= BigInt(0)) {
          throw new Error("Collateral amount and mint amount must be positive.");
        }

        setStep("approving");
        setStatusMessage(`Approving ${collateralSymbol}...`);

        const approveHash = await writeContractAsync({
          address: collateralAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [contracts.dscEngine as `0x${string}`, collateralAmount],
        });

        setTxHash(approveHash);
        setStep("approve-confirming");
        setStatusMessage("Waiting for collateral approval...");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        setStep("depositing-and-minting");
        setStatusMessage("Submitting deposit + mint transaction...");

        const flowHash = await writeContractAsync({
          address: contracts.dscEngine as `0x${string}`,
          abi: dscEngineAbi,
          functionName: "depositCollateralAndMintDsc",
          args: [
            collateralAddress as `0x${string}`,
            collateralAmount,
            mintAmount,
          ],
        });

        setTxHash(flowHash);
        setStep("deposit-mint-confirming");
        setStatusMessage("Waiting for protocol confirmation...");
        await publicClient.waitForTransactionReceipt({ hash: flowHash });

        if (options?.onSuccess) {
          await options.onSuccess();
        }

        setStep("success");
        setStatusMessage("Deposit + mint transaction confirmed.");
        return flowHash;
      } catch (err) {
        const nextError =
          err instanceof Error ? err : new Error(getErrorMessage(err));
        setError(nextError);
        setStep("error");
        setStatusMessage(nextError.message);
        throw nextError;
      }
    },
    [enabled, contracts, publicClient, writeContractAsync, options],
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
    step === "depositing-and-minting" ||
    step === "deposit-mint-confirming";

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
    depositAndMint,
    reset,
    status,
    error,
  };
}
