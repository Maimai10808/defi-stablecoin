"use client";

import { useCallback, useMemo, useState } from "react";
import { BaseError, parseUnits } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { dscEngineAbi, erc20Abi } from "@/lib/contracts/abi";
import {
  type CollateralSymbol,
  getAddressKeyForSymbol,
} from "@/lib/protocol/collateral";
import { DEFAULT_TOKEN_DECIMALS } from "@/lib/protocol/tokenUnits";

type RedeemStep =
  | "idle"
  | "redeeming"
  | "redeem-confirming"
  | "success"
  | "error";

type UseDscRedeemCollateralOptions = {
  onSuccess?: () => Promise<void> | void;
};

function getErrorMessage(error: unknown) {
  if (!error) return "Unknown error";
  if (error instanceof BaseError) return error.shortMessage || error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export function useDscRedeemCollateral(
  options?: UseDscRedeemCollateralOptions,
) {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId });
  const { contracts, isSupportedChain } = useProtocolContracts();
  const { writeContractAsync } = useWriteContract();

  const [step, setStep] = useState<RedeemStep>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const enabled = Boolean(
    address &&
    isConnected &&
    isSupportedChain &&
    contracts?.dscEngine &&
    contracts?.weth &&
    publicClient,
  );

  const redeemCollateral = useCallback(
    async (collateralSymbol: CollateralSymbol, amountInput: string) => {
      const addressKey = getAddressKeyForSymbol(collateralSymbol);
      const collateralAddress = addressKey ? contracts?.[addressKey] : undefined;

      if (!enabled || !contracts || !publicClient) {
        const nextError = new Error(
          "Wallet or contract configuration is not ready.",
        );
        setError(nextError);
        setStep("error");
        setStatusMessage(nextError.message);
        throw nextError;
      }

      if (!collateralAddress) {
        const nextError = new Error("Selected collateral is not available.");
        setError(nextError);
        setStep("error");
        setStatusMessage(nextError.message);
        throw nextError;
      }

      try {
        setError(null);
        setTxHash(null);

        const decimals = Number(
          await publicClient.readContract({
            address: collateralAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "decimals",
          }),
        );

        const amount = parseUnits(
          amountInput || "0",
          decimals || DEFAULT_TOKEN_DECIMALS,
        );
        if (amount <= BigInt(0)) {
          throw new Error("Amount must be greater than zero.");
        }

        setStep("redeeming");
        setStatusMessage("Submitting redeem transaction...");

        const hash = await writeContractAsync({
          address: contracts.dscEngine as `0x${string}`,
          abi: dscEngineAbi,
          functionName: "redeemCollateral",
          args: [collateralAddress as `0x${string}`, amount],
        });

        setTxHash(hash);
        setStep("redeem-confirming");
        setStatusMessage("Waiting for redeem confirmation...");

        await publicClient.waitForTransactionReceipt({ hash });

        if (options?.onSuccess) {
          await options.onSuccess();
        }

        setStep("success");
        setStatusMessage("Redeem transaction confirmed.");
        return hash;
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

  const isPending = step === "redeeming" || step === "redeem-confirming";

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
    redeemCollateral,
    reset,
    status,
    error,
  };
}
