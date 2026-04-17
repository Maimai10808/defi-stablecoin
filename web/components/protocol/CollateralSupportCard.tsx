import { ActionInfoRow } from "@/components/dsc/ActionInfoRow";

export function CollateralSupportCard() {
  return (
    <section className="cyber-panel cyber-panel-hover p-5 md:p-6">
      <div>
        <div className="cyber-kicker">Multi-Asset Rail</div>
        <h2 className="cyber-title mt-3">Collateral Support</h2>
        <p className="cyber-description mt-2 text-sm">
          Both supported collateral assets are surfaced in the demo and are
          usable in deposit, redeem, combined, and liquidation flows.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="cyber-chip">WETH rail online</span>
        <span className="cyber-chip">WBTC rail online</span>
        <span className="cyber-chip">price feed synced</span>
      </div>

      <div className="mt-5 space-y-2">
        <ActionInfoRow label="Token A" value="WETH" />
        <ActionInfoRow label="Token B" value="WBTC" />
        <ActionInfoRow
          label="Why it matters"
          value="Shows the protocol is multi-collateral, not a single-asset mock."
        />
        <ActionInfoRow
          label="UI coverage"
          value="Base flows and combined flows now allow asset switching."
        />
      </div>
    </section>
  );
}
