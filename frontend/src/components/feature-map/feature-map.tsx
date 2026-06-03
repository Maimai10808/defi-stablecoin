"use client";

import {
  Activity,
  Coins,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Map,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionCard, MotionRevealList } from "@/components/motion";

const features = [
  {
    title: "Protocol Status",
    description: "Check network, wallet, contract address, and protocol readability.",
    icon: LayoutDashboard,
  },
  {
    title: "My Position",
    description: "Read collateral value, minted DSC, wallet balances, and allowance.",
    icon: Wallet,
  },
  {
    title: "Faucet",
    description: "Mint local mock WETH or WBTC for demo testing.",
    icon: Coins,
  },
  {
    title: "Deposit & Mint",
    description: "Deposit collateral and mint DSC through DSCEngine.",
    icon: ListChecks,
  },
  {
    title: "Repay & Redeem",
    description: "Burn DSC debt and redeem deposited collateral.",
    icon: Activity,
  },
  {
    title: "Health Factor",
    description: "Explain and visualize account liquidation risk.",
    icon: Gauge,
  },
  {
    title: "Liquidation Demo",
    description: "Demonstrate how unsafe positions can be liquidated.",
    icon: ShieldAlert,
  },
];

export function FeatureMap() {
  return (
    <MotionCard>
      <Card id="feature-map" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="size-5" />
          Feature Map
        </CardTitle>
        <CardDescription>
          A feature-level map of every module in this DSC dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <MotionRevealList className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-4 text-muted-foreground" />
                  <p className="text-sm font-medium">{feature.title}</p>
                </div>

                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </MotionRevealList>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
