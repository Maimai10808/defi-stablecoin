"use client";

import { useDscAccountOverview } from "@/hooks/useDscAccountOverview";
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
      <span className="text-sm font-medium break-all">{value ?? "--"}</span>
    </div>
  );
}

export function DscAccountOverviewCard() {
  const {
    address,
    chainId,
    isConnected,
    isSupportedChain,
    overview,
    isLoading,
    isFetching,
    isError,
    error,
  } = useDscAccountOverview();

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Account Overview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Read-only protocol state for the connected wallet
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
      ) : isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Loading account data...
        </p>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-500">
          Failed to load account data: {error?.message ?? "Unknown error"}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {isFetching ? (
            <p className="text-xs text-muted-foreground">Refreshing...</p>
          ) : null}

          <OverviewRow label="Wallet Address" value={address} />
          <OverviewRow
            label="Health Factor"
            value={overview?.formatted?.healthFactor ?? "--"}
          />
          <OverviewRow
            label="Total DSC Minted"
            value={overview?.formatted?.totalDscMinted ?? "--"}
          />
          <OverviewRow
            label="Collateral Value (USD)"
            value={overview?.formatted?.collateralValueInUsd ?? "--"}
          />
          <OverviewRow
            label="DSC Balance"
            value={overview?.formatted?.dscBalance ?? "--"}
          />
        </div>
      )}
    </section>
  );
}
