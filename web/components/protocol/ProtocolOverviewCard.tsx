export function ProtocolOverviewCard() {
  return (
    <section className="cyber-panel cyber-grid relative isolate p-6 md:p-8 lg:p-10">
      <div className="absolute inset-x-6 top-6 z-0 hidden h-px bg-[linear-gradient(90deg,transparent,var(--accent),var(--accent-secondary),transparent)] opacity-60 lg:block" />
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-4xl">
          <div className="cyber-terminal-bar">
            <span className="cyber-terminal-dot text-[var(--destructive)]" />
            <span className="cyber-terminal-dot text-[var(--accent-secondary)]" />
            <span className="cyber-terminal-dot text-[var(--accent)]" />
            breached_interface://stablecoin-protocol
          </div>
          <p className="cyber-kicker mt-6">DSCoin Protocol Demo</p>
          <h1
            className="cyber-heading cyber-glitch mt-4 max-w-4xl text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl"
            data-text="Overcollateralized Stablecoin Control Surface"
          >
            Overcollateralized Stablecoin Control Surface
          </h1>
          <p className="cyber-description cyber-cursor mt-5 max-w-2xl text-sm sm:text-base">
            This front end is intentionally minimal. It exists to demonstrate
            the contract loop clearly: deposit collateral, mint DSC, monitor
            health factor, burn to reduce debt, redeem collateral, and liquidate
            unsafe positions.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px] lg:-skew-y-1">
          <div className="cyber-panel bg-[rgb(28_28_46_/_0.55)] px-4 py-4 lg:translate-y-2">
            <div className="cyber-subtitle">
              Collateral
            </div>
            <div className="mt-3 font-[var(--font-orbitron)] text-lg font-semibold text-[var(--accent)]">
              WETH + WBTC
            </div>
          </div>
          <div className="cyber-panel bg-[rgb(28_28_46_/_0.55)] px-4 py-4 lg:-translate-y-3">
            <div className="cyber-subtitle">
              Safety Rule
            </div>
            <div className="mt-3 font-[var(--font-orbitron)] text-lg font-semibold text-[var(--accent-tertiary)]">
              HF must stay {">"} 1
            </div>
          </div>
          <div className="cyber-panel bg-[rgb(28_28_46_/_0.55)] px-4 py-4 lg:translate-y-4">
            <div className="cyber-subtitle">
              Test Focus
            </div>
            <div className="mt-3 font-[var(--font-orbitron)] text-lg font-semibold text-[var(--accent-secondary)]">
              Unit + fuzz + invariant
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
