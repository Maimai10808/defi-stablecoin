// web/components/dsc/DscAccountOverviewCard.tsx
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

  if (!isConnected) {
    return (
      <section className="rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Account Overview</h2>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Wallet not connected.
        </p>

        <div className="mt-4">
          <WalletConnectCard />
        </div>
      </section>
    );
  }

  if (!isSupportedChain) {
    return (
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Account Overview</h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Unsupported chain. Current chainId: {chainId ?? "unknown"}
        </p>

        <div className="mt-4">
          <WalletConnectCard />
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Account Overview</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Loading account data...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border p-4">
        <h2 className="text-lg font-semibold">Account Overview</h2>
        <p className="mt-2 text-sm text-red-500">
          Failed to load account data: {error?.message ?? "Unknown error"}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Account Overview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Read-only protocol state for the connected wallet
          </p>
        </div>

        {isFetching ? (
          <span className="text-xs text-muted-foreground">Refreshing...</span>
        ) : null}
      </div>

      <div className="mt-4 space-y-3">
        <OverviewRow label="Wallet Address" value={address} />
        <OverviewRow
          label="Collateral Value (USD)"
          value={overview?.formatted?.collateralValueInUsd ?? "--"}
        />
        <OverviewRow
          label="DSC Balance"
          value={overview?.formatted?.dscBalance ?? "--"}
        />
        <OverviewRow
          label="Total DSC Minted"
          value={overview?.formatted?.totalDscMinted ?? "--"}
        />
        <OverviewRow
          label="Health Factor"
          value={overview?.formatted?.healthFactor ?? "--"}
        />
      </div>
    </section>
  );
}
