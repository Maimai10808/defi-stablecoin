"use client";

import { WalletConnectCard } from "../wallet/WalletDebugCard";
import { useDscCollateralOverview } from "@/hooks/useDscCollateralOverview";

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

export function DscCollateralOverviewCard() {
  const {
    chainId,
    isConnected,
    isSupportedChain,
    overview,
    isLoading,
    isFetching,
    isError,
    error,
  } = useDscCollateralOverview();

  return (
    <section className="rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Collateral Overview</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Read-only collateral state for the connected wallet
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
          Loading collateral data...
        </p>
      ) : isError ? (
        <p className="mt-4 text-sm text-red-500">
          Failed to load collateral data: {error?.message ?? "Unknown error"}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {isFetching ? (
            <p className="text-xs text-muted-foreground">Refreshing...</p>
          ) : null}

          <OverviewRow
            label="WETH Address"
            value={overview?.tokens?.weth ?? "--"}
          />
          <OverviewRow
            label="WBTC Address"
            value={overview?.tokens?.wbtc ?? "--"}
          />
          <OverviewRow
            label="WETH Deposited"
            value={overview?.formatted?.wethDeposited ?? "--"}
          />
          <OverviewRow
            label="WETH Value (USD)"
            value={overview?.formatted?.wethUsdValue ?? "--"}
          />
          <OverviewRow
            label="WBTC Deposited"
            value={overview?.formatted?.wbtcDeposited ?? "--"}
          />
          <OverviewRow
            label="WBTC Value (USD)"
            value={overview?.formatted?.wbtcUsdValue ?? "--"}
          />
          <OverviewRow
            label="Total Collateral Value (USD)"
            value={overview?.formatted?.totalCollateralUsd ?? "--"}
          />
        </div>
      )}
    </section>
  );
}
