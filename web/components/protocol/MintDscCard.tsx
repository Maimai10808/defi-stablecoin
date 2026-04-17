"use client";

import { useMemo } from "react";
import { formatUnits } from "viem";

import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
import { useDscMintDsc } from "@/hooks/useDscMintDsc";
import { WalletConnectCard } from "../wallet/WalletDebugCard";

function OverviewRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border px-3 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="break-all text-sm font-medium">{value ?? "--"}</span>
    </div>
  );
}

function format18(value: bigint | undefined, digits = 4) {
  if (value === undefined) return "--";
  return Number(formatUnits(value, 18)).toFixed(digits);
}

const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);

function formatHealthFactor(value: bigint | undefined, digits = 4) {
  if (value === undefined) return "--";
  if (value === MAX_UINT256) return "∞";
  return Number(formatUnits(value, 18)).toFixed(digits);
}

export function MintDscCard() {
  const {
    address,
    isConnected,
    isSupportedChain,
    chainId,
    amount,
    setAmount,
    mint,
    clear,
    canMint,
    validationMessage,
    isWritePending,
    isConfirming,
    isConfirmed,
    isError,
    error,
  } = useDscMintDsc();

  const {
    overview,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
  } = useDscAccountOverview();

  const status = useMemo(() => {
    if (!isConnected) return "idle";
    if (isWritePending) return "awaiting wallet";
    if (isConfirming) return "confirming";
    if (isConfirmed) return "success";
    if (isError) return "error";
    return "ready";
  }, [isConnected, isWritePending, isConfirming, isConfirmed, isError]);

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Mint DSC</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Minimal DSC mint flow for local protocol testing
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
            <label htmlFor="mint-dsc-amount" className="text-sm font-medium">
              DSC Amount
            </label>
            <input
              id="mint-dsc-amount"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
            />
          </div>

          <OverviewRow label="Status" value={status} />
          <OverviewRow label="Wallet" value={address} />

          <OverviewRow
            label="Current Total DSC Minted"
            value={format18(overview?.raw.totalDscMinted)}
          />
          <OverviewRow
            label="Current Collateral Value"
            value={format18(overview?.raw.collateralValueInUsd)}
          />
          <OverviewRow
            label="Current Health Factor"
            value={formatHealthFactor(overview?.raw.healthFactor)}
          />

          {isOverviewLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading account overview...
            </p>
          ) : null}

          {isOverviewFetching ? (
            <p className="text-xs text-muted-foreground">
              Refreshing account state...
            </p>
          ) : null}

          {validationMessage ? (
            <p className="text-sm text-muted-foreground">{validationMessage}</p>
          ) : null}

          {isError ? (
            <p className="text-sm text-red-500">
              Mint failed: {error?.message ?? "Unknown error"}
            </p>
          ) : null}

          {isConfirmed ? (
            <p className="text-sm text-green-600">
              Mint transaction confirmed.
            </p>
          ) : null}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void mint()}
              disabled={!canMint}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isWritePending
                ? "Check Wallet"
                : isConfirming
                  ? "Minting..."
                  : "Mint DSC"}
            </button>

            <button
              type="button"
              onClick={clear}
              className="rounded-xl border px-4 py-2 text-sm font-medium"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
