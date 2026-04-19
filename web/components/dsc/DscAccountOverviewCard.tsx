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
    <div className="cyber-row">
      <span className="cyber-row-label">{label}</span>
      <span className="cyber-row-value break-all">{value ?? "--"}</span>
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
      <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="cyber-title">Account Overview</h2>
        </div>

        <p className="cyber-description mt-3 text-sm">Wallet not connected.</p>

        <div className="mt-4">
          <WalletConnectCard />
        </div>
      </section>
    );
  }

  if (!isSupportedChain) {
    return (
      <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
        <h2 className="cyber-title">Account Overview</h2>

        <p className="cyber-description mt-3 text-sm">
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
      <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
        <h2 className="cyber-title">Account Overview</h2>
        <p className="cyber-description mt-3 text-sm">
          Loading account data...
        </p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
        <h2 className="cyber-title">Account Overview</h2>
        <p className="mt-3 text-sm text-[var(--destructive)]">
          Failed to load account data: {error?.message ?? "Unknown error"}
        </p>
      </section>
    );
  }

  return (
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="cyber-kicker">Wallet + Vault State</div>
          <h2 className="cyber-title mt-3">Account Overview</h2>
          <p className="cyber-description mt-2 text-sm">
            Read-only wallet balances and protocol state for the connected
            wallet
          </p>
        </div>

        {isFetching ? <span className="cyber-chip">Refreshing</span> : null}
      </div>

      <div className="mt-5 space-y-3">
        <OverviewRow label="Wallet Address" value={address} />
        <OverviewRow
          label="ETH Balance"
          value={overview?.formatted?.ethBalance ?? "--"}
        />
        <OverviewRow
          label="WETH Wallet Balance"
          value={overview?.formatted?.wethBalance ?? "--"}
        />
        <OverviewRow
          label="WBTC Wallet Balance"
          value={overview?.formatted?.wbtcBalance ?? "--"}
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
