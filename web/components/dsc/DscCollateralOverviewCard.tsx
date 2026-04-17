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
    <div className="cyber-row">
      <span className="cyber-row-label">{label}</span>
      <span className="cyber-row-value break-all">{value ?? "--"}</span>
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
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="cyber-kicker">Collateral Ledger</div>
          <h2 className="cyber-title mt-3">Collateral Overview</h2>
          <p className="cyber-description mt-2 text-sm">
            Read-only collateral state for the connected wallet
          </p>
        </div>

        <WalletConnectCard />
      </div>

      {!isConnected ? (
        <p className="cyber-description mt-5 text-sm">
          Wallet not connected.
        </p>
      ) : !isSupportedChain ? (
        <p className="cyber-description mt-5 text-sm">
          Unsupported chain. Current chainId: {chainId ?? "unknown"}
        </p>
      ) : isLoading ? (
        <p className="cyber-description mt-5 text-sm">
          Loading collateral data...
        </p>
      ) : isError ? (
        <p className="mt-5 text-sm text-[var(--destructive)]">
          Failed to load collateral data: {error?.message ?? "Unknown error"}
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {isFetching ? (
            <p className="cyber-chip">Refreshing</p>
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
