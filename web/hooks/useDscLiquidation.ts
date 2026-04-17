"use client";

import { useCallback, useMemo, useState } from "react";
import { BaseError, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { dscAbi, dscEngineAbi } from "@/lib/contracts/abi";
import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import {
  type CollateralSymbol,
  getAddressKeyForSymbol,
} from "@/lib/protocol/collateral";

type LiquidationStep =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "liquidating"
  | "liquidation-confirming"
  | "success"
  | "error";

type UseDscLiquidationOptions = {
  onSuccess?: () => Promise<void> | void;
};

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (error instanceof BaseError) return error.shortMessage || error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDscLiquidation(options?: UseDscLiquidationOptions) {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { contracts, isSupportedChain } = useProtocolContracts();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<LiquidationStep>("idle");
  const [statusMessage, setStatusMessage] = useState("");
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

  const liquidate = useCallback(
    async (
      collateralSymbol: CollateralSymbol,
      targetUser: `0x${string}`,
      debtToCoverInput: string,
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

        const debtToCover = parseUnits(debtToCoverInput || "0", 18);
        if (debtToCover <= BigInt(0)) {
          throw new Error("Debt to cover must be greater than zero.");
        }

        setStep("approving");
        setStatusMessage("Approving DSC for liquidation...");

        const approveHash = await writeContractAsync({
          address: contracts.dsc as `0x${string}`,
          abi: dscAbi,
          functionName: "approve",
          args: [contracts.dscEngine as `0x${string}`, debtToCover],
        });

        setTxHash(approveHash);
        setStep("approve-confirming");
        setStatusMessage("Waiting for DSC approval...");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        setStep("liquidating");
        setStatusMessage("Submitting liquidation transaction...");

        const liquidationHash = await writeContractAsync({
          address: contracts.dscEngine as `0x${string}`,
          abi: dscEngineAbi,
          functionName: "liquidate",
          args: [
            collateralAddress as `0x${string}`,
            targetUser,
            debtToCover,
          ],
        });

        setTxHash(liquidationHash);
        setStep("liquidation-confirming");
        setStatusMessage("Waiting for liquidation confirmation...");
        await publicClient.waitForTransactionReceipt({ hash: liquidationHash });

        if (options?.onSuccess) {
          await options.onSuccess();
        }

        setStep("success");
        setStatusMessage("Liquidation transaction confirmed.");
        return liquidationHash;
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
    step === "liquidating" ||
    step === "liquidation-confirming";

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
    liquidate,
    reset,
    status,
    error,
  };
}
