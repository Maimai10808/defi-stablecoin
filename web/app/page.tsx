import { DscAccountOverviewCard } from "@/components/dsc/DscAccountOverviewCard";
import { DscCollateralOverviewCard } from "@/components/dsc/DscCollateralOverviewCard";
import { ProtocolActionsSection } from "@/components/dsc/ProtocolActionsSection";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <DscAccountOverviewCard />
        <DscCollateralOverviewCard />
      </section>

      <ProtocolActionsSection />
    </main>
  );
}
