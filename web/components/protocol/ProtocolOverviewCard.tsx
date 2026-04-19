export function ProtocolOverviewCard() {
  return (
    <section className="cyber-panel cyber-grid relative isolate overflow-hidden p-5 sm:p-6 md:p-8 lg:p-10">
      <div className="absolute inset-x-4 top-5 z-0 hidden h-px bg-[linear-gradient(90deg,transparent,var(--accent),var(--accent-secondary),transparent)] opacity-60 lg:block" />

      <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between xl:gap-10">
        <div className="min-w-0 max-w-4xl flex-1">
          <div className="cyber-terminal-bar max-w-fit">
            <span className="cyber-terminal-dot text-[var(--destructive)]" />
            <span className="cyber-terminal-dot text-[var(--accent-secondary)]" />
            <span className="cyber-terminal-dot text-[var(--accent)]" />
            breached_interface://stablecoin-protocol
          </div>

          <p className="cyber-kicker mt-6">DSCoin Protocol Demo</p>

          <h1
            className="cyber-heading cyber-glitch mt-4 max-w-4xl text-4xl font-black leading-[0.95] sm:text-5xl lg:text-6xl xl:text-7xl"
            data-text="Overcollateralized Stablecoin Control Surface"
          >
            Overcollateralized Stablecoin Control Surface
          </h1>

          <p className="mt-4 max-w-3xl text-xs font-medium uppercase tracking-[0.18em] text-[var(--accent-secondary)] sm:text-sm">
            Oracle-integrated protocol flow. This local demo uses mock price
            feeds for deterministic testing: WETH = 2000 USD, WBTC = 1000 USD.
          </p>

          <p className="cyber-description cyber-cursor mt-5 max-w-2xl text-sm sm:text-base">
            This front end is intentionally minimal. It exists to demonstrate
            the contract loop clearly: deposit collateral, mint DSC, monitor
            health factor, burn to reduce debt, redeem collateral, and liquidate
            unsafe positions.
          </p>
        </div>

        <div className="w-full xl:max-w-[420px] xl:shrink-0">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="cyber-panel bg-[rgb(28_28_46_/_0.55)] px-4 py-4 xl:translate-y-2">
              <div className="cyber-subtitle">Collateral</div>
              <div className="mt-3 break-words font-[var(--font-orbitron)] text-base font-semibold text-[var(--accent)] sm:text-lg">
                WETH + WBTC
              </div>
            </div>

            <div className="cyber-panel bg-[rgb(28_28_46_/_0.55)] px-4 py-4 xl:-translate-y-3">
              <div className="cyber-subtitle">Safety Rule</div>
              <div className="mt-3 break-words font-[var(--font-orbitron)] text-base font-semibold text-[var(--accent-tertiary)] sm:text-lg">
                HF must stay {">"} 1
              </div>
            </div>

            <div className="cyber-panel bg-[rgb(28_28_46_/_0.55)] px-4 py-4 xl:translate-y-4 sm:col-span-2 xl:col-span-1">
              <div className="cyber-subtitle">Test Focus</div>
              <div className="mt-3 break-words font-[var(--font-orbitron)] text-base font-semibold text-[var(--accent-secondary)] sm:text-lg">
                Unit + fuzz + invariant
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
