"use client";

import { dscEngineAbi } from "@/lib/contracts/abi";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

type UseDepositCollateralParams = {
  dscEngineAddress?: `0x${string}`;
};

export function useDepositCollateral({
  dscEngineAddress,
}: UseDepositCollateralParams) {
  const {
    writeContract,
    data: depositHash,
    error: depositWriteError,
    isPending: isDepositWritePending,
  } = useWriteContract();

  const depositReceipt = useWaitForTransactionReceipt({
    hash: depositHash,
    query: {
      enabled: Boolean(depositHash),
    },
  });

  function depositCollateral(tokenAddress: `0x${string}`, amount: bigint) {
    if (!dscEngineAddress) return;

    writeContract({
      address: dscEngineAddress,
      abi: dscEngineAbi,
      functionName: "depositCollateral",
      args: [tokenAddress, amount],
    });
  }

  return {
    depositCollateral,
    depositHash,
    isDepositWritePending,
    isDepositConfirming: depositReceipt.isLoading,
    isDepositConfirmed: depositReceipt.isSuccess,
    isError: Boolean(depositWriteError) || depositReceipt.isError,
    error: depositWriteError ?? (depositReceipt.error as Error | null) ?? null,
  };
}
