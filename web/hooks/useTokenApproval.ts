"use client";

import { useMemo } from "react";
import { erc20Abi } from "@/lib/contracts/abi";
import {
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";

type UseTokenApprovalParams = {
  tokenAddress?: `0x${string}`;
  spenderAddress?: `0x${string}`;
  ownerAddress?: `0x${string}`;
  amount?: bigint;
  enabled?: boolean;
};

export function useTokenApproval({
  tokenAddress,
  spenderAddress,
  ownerAddress,
  amount,
  enabled = true,
}: UseTokenApprovalParams) {
  const canReadAllowance = Boolean(
    enabled && tokenAddress && spenderAddress && ownerAddress,
  );

  const allowanceQuery = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args:
      canReadAllowance && ownerAddress && spenderAddress
        ? [ownerAddress, spenderAddress]
        : undefined,
    query: {
      enabled: canReadAllowance,
    },
  });

  const {
    writeContract,
    data: approveHash,
    error: approveWriteError,
    isPending: isApproveWritePending,
  } = useWriteContract();

  const approveReceipt = useWaitForTransactionReceipt({
    hash: approveHash,
    query: {
      enabled: Boolean(approveHash),
    },
  });

  const allowance =
    allowanceQuery.data !== undefined
      ? (allowanceQuery.data as bigint)
      : undefined;

  const isApproved = useMemo(() => {
    if (amount === undefined) return false;
    if (allowance === undefined) return false;
    return allowance >= amount;
  }, [allowance, amount]);

  function approve() {
    if (!tokenAddress || !spenderAddress || amount === undefined) return;

    writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [spenderAddress, amount],
    });
  }

  return {
    allowance,
    isApproved,
    approve,
    approveHash,
    isAllowanceLoading: allowanceQuery.isLoading,
    isAllowanceFetching: allowanceQuery.isFetching,
    isApproveWritePending,
    isApproveConfirming: approveReceipt.isLoading,
    isApproveConfirmed: approveReceipt.isSuccess,
    isError:
      allowanceQuery.isError ||
      Boolean(approveWriteError) ||
      approveReceipt.isError,
    error:
      (allowanceQuery.error as Error | null) ??
      approveWriteError ??
      (approveReceipt.error as Error | null) ??
      null,
    refetchAllowance: allowanceQuery.refetch,
  };
}
