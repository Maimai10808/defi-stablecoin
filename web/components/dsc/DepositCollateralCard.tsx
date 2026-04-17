"use client";

import { useEffect, useMemo, useState } from "react";
import { parseUnits } from "viem";

import { useAccount } from "wagmi";
import { useProtocolContracts } from "@/hooks/useProtocolContracts";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import { useDepositCollateral } from "@/hooks/useDepositCollateral";
import { WalletConnectCard } from "../wallet/WalletDebugCard";

function parseAmountToWei(value: string) {
  if (!value.trim()) return undefined;

  try {
    return parseUnits(value, 18);
  } catch {
    return undefined;
  }
}

export function DepositCollateralCard() {
  const { address, isConnected, chainId } = useAccount();
  const { contracts, isSupportedChain } = useProtocolContracts();

  const [amount, setAmount] = useState("");

  const wethAddress = contracts?.weth as `0x${string}` | undefined;
  const dscEngineAddress = contracts?.dscEngine as `0x${string}` | undefined;

  const parsedAmount = useMemo(() => parseAmountToWei(amount), [amount]);

  const {
    isApproved,
    approve,
    isAllowanceLoading,
    isApproveWritePending,
    isApproveConfirming,
    isApproveConfirmed,
    error: approvalError,
    refetchAllowance,
  } = useTokenApproval({
    tokenAddress: wethAddress,
    spenderAddress: dscEngineAddress,
    ownerAddress: address,
    amount: parsedAmount,
    enabled: Boolean(
      isConnected &&
      isSupportedChain &&
      wethAddress &&
      dscEngineAddress &&
      address &&
      parsedAmount,
    ),
  });

  const {
    depositCollateral,
    isDepositWritePending,
    isDepositConfirming,
    isDepositConfirmed,
    error: depositError,
  } = useDepositCollateral({
    dscEngineAddress,
  });

  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance();
    }
  }, [isApproveConfirmed, refetchAllowance]);

  const canApprove =
    Boolean(
      isConnected &&
      isSupportedChain &&
      wethAddress &&
      dscEngineAddress &&
      parsedAmount &&
      parsedAmount > BigInt(0) &&
      !isApproved,
    ) &&
    !isApproveWritePending &&
    !isApproveConfirming;

  const canDeposit =
    Boolean(
      isConnected &&
      isSupportedChain &&
      wethAddress &&
      parsedAmount &&
      parsedAmount > BigInt(0) &&
      isApproved,
    ) &&
    !isDepositWritePending &&
    !isDepositConfirming;

  const isBusy =
    isAllowanceLoading ||
    isApproveWritePending ||
    isApproveConfirming ||
    isDepositWritePending ||
    isDepositConfirming;

  const error = approvalError ?? depositError ?? null;

  function handleApprove() {
    if (!canApprove) return;
    approve();
  }

  function handleDeposit() {
    if (!canDeposit || !wethAddress || !parsedAmount) return;
    depositCollateral(wethAddress, parsedAmount);
  }

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Deposit Collateral</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimal write flow: approve WETH first, then deposit into DSCEngine
          </p>
        </div>

        <WalletConnectCard />
      </div>

      {!isConnected ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Wallet not connected.
        </p>
      ) : !isSupportedChain ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Unsupported chain. Current chainId: {chainId ?? "unknown"}
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="deposit-amount" className="text-sm font-medium">
              WETH Amount
            </label>

            <input
              id="deposit-amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.1"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="rounded-xl border p-3 text-sm space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">WETH</span>
              <span className="break-all">{wethAddress ?? "--"}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">DSCEngine</span>
              <span className="break-all">{dscEngineAddress ?? "--"}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Parsed Amount</span>
              <span className="break-all">
                {parsedAmount !== undefined ? parsedAmount.toString() : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Approval Status</span>
              <span>{isApproved ? "Approved" : "Not approved"}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={!canApprove}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isApproveWritePending || isApproveConfirming
                ? "Approving..."
                : "Approve WETH"}
            </button>

            <button
              type="button"
              onClick={handleDeposit}
              disabled={!canDeposit}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {isDepositWritePending || isDepositConfirming
                ? "Depositing..."
                : "Deposit WETH"}
            </button>
          </div>

          {isApproveConfirmed ? (
            <p className="text-xs text-green-600">Approval confirmed.</p>
          ) : null}

          {isDepositConfirmed ? (
            <p className="text-xs text-green-600">Deposit confirmed.</p>
          ) : null}

          {isBusy ? (
            <p className="text-xs text-muted-foreground">
              Transaction in progress...
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-500 break-all">{error.message}</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
