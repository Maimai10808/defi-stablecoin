import { DscAccountOverviewCard } from "@/components/dsc/DscAccountOverviewCard";
import { DscCollateralOverviewCard } from "@/components/dsc/DscCollateralOverviewCard";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <DscAccountOverviewCard />
      <DscCollateralOverviewCard />
    </>
  );
}
