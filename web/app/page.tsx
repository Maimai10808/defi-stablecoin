import { DepositCollateralCard } from "@/components/dsc/DepositCollateralCard";
import { DscAccountOverviewCard } from "@/components/dsc/DscAccountOverviewCard";
import { DscCollateralOverviewCard } from "@/components/dsc/DscCollateralOverviewCard";
import { MintDscCard } from "@/components/protocol/MintDscCard";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <DscAccountOverviewCard />
      <DscCollateralOverviewCard />
      <DepositCollateralCard />
      <MintDscCard />
    </>
  );
}
