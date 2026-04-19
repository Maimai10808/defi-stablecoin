"use client";

import { useCallback, useMemo, useState } from "react";
import { BaseError, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { dscAbi, dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";
import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import {
  type CollateralSymbol,
  getAddressKeyForSymbol,
} from "@/lib/protocol/collateral";
import { DEFAULT_TOKEN_DECIMALS, DSC_DECIMALS } from "@/lib/protocol/tokenUnits";

type BurnAndRedeemStep =
  | "idle"
  | "approving"
  | "approve-confirming"
  | "burning-and-redeeming"
  | "burn-redeem-confirming"
  | "success"
  | "error";

type UseDscBurnAndRedeemOptions = {
  onSuccess?: () => Promise<void> | void;
};

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (error instanceof BaseError) return error.shortMessage || error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDscBurnAndRedeem(options?: UseDscBurnAndRedeemOptions) {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { contracts, isSupportedChain } = useProtocolContracts();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<BurnAndRedeemStep>("idle");
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

  const burnAndRedeem = useCallback(
    async (
      collateralSymbol: CollateralSymbol,
      collateralAmountInput: string,
      burnAmountInput: string,
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

        const collateralDecimals = Number(
          await publicClient.readContract({
            address: collateralAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          }),
        );

        const collateralAmount = parseUnits(
          collateralAmountInput || "0",
          collateralDecimals || DEFAULT_TOKEN_DECIMALS,
        );
        const burnAmount = parseUnits(burnAmountInput || "0", DSC_DECIMALS);

        if (collateralAmount <= BigInt(0) || burnAmount <= BigInt(0)) {
          throw new Error(
            "Redeem amount and burn amount must both be greater than zero.",
          );
        }

        setStep("approving");
        setStatusMessage("Approving DSC for protocol burn...");

        const approveHash = await writeContractAsync({
          address: contracts.dsc as `0x${string}`,
          abi: dscAbi,
          functionName: "approve",
          args: [contracts.dscEngine as `0x${string}`, burnAmount],
        });

        setTxHash(approveHash);
        setStep("approve-confirming");
        setStatusMessage("Waiting for DSC approval...");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        setStep("burning-and-redeeming");
        setStatusMessage("Submitting burn + redeem transaction...");

        const flowHash = await writeContractAsync({
          address: contracts.dscEngine as `0x${string}`,
          abi: dscEngineAbi,
          functionName: "redeemCollateralForDsc",
          args: [
            collateralAddress as `0x${string}`,
            collateralAmount,
            burnAmount,
          ],
        });

        setTxHash(flowHash);
        setStep("burn-redeem-confirming");
        setStatusMessage("Waiting for protocol confirmation...");
        await publicClient.waitForTransactionReceipt({ hash: flowHash });

        if (options?.onSuccess) {
          await options.onSuccess();
        }

        setStep("success");
        setStatusMessage("Burn + redeem transaction confirmed.");
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
    step === "burning-and-redeeming" ||
    step === "burn-redeem-confirming";

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
    burnAndRedeem,
    reset,
    status,
    error,
  };
}
