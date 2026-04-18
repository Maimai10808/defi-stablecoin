import { DscAccountOverviewCard } from "@/components/dsc/DscAccountOverviewCard";
import { DscCollateralOverviewCard } from "@/components/dsc/DscCollateralOverviewCard";
import { ProtocolActionsSection } from "@/components/dsc/ProtocolActionsSection";
import { CombinedFlowSection } from "@/components/protocol/CombinedFlowSection";
import { CollateralSupportCard } from "@/components/protocol/CollateralSupportCard";
import { LiquidationCard } from "@/components/protocol/LiquidationCard";
import { ProtocolOverviewCard } from "@/components/protocol/ProtocolOverviewCard";
import { WalletConnectCard } from "@/components/wallet/WalletDebugCard";

export default function Home() {
  return (
    <main
      className="cyber-page relative isolate mx-auto flex w-full max-w-7xl flex-col
     gap-8 overflow-x-clip px-4 py-8 sm:px-6 lg:gap-10 lg:px-8 lg:py-12"
    >
      <WalletConnectCard />
      <ProtocolOverviewCard />

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6">
        <DscAccountOverviewCard />
        <DscCollateralOverviewCard />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-start lg:gap-6">
        <CollateralSupportCard />
        <CombinedFlowSection />
      </section>

      <ProtocolActionsSection />

      <LiquidationCard />
    </main>
  );
}
