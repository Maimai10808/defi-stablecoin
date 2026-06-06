"use client";

import {
  BookOpen,
  CheckCircle2,
  Coins,
  Gauge,
  Layers,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MotionCard, MotionRevealList } from "@/components/motion";

const guideItems = [
  {
    title: "Connect Local Wallet",
    description:
      "Connect your wallet to the local Anvil network before interacting with the protocol.",
    icon: CheckCircle2,
  },
  {
    title: "Get Mock Tokens",
    description:
      "Use the Faucet page to mint WETH or WBTC mock tokens for local testing.",
    icon: PlayCircle,
  },
  {
    title: "Follow the Protocol Flow",
    description:
      "Deposit, mint, monitor risk, repay or redeem, then explore liquidation as separate actions.",
    icon: Layers,
  },
];

const overviewItems = [
  {
    title: "Overcollateralized Stablecoin",
    description:
      "Users deposit crypto assets such as WETH or WBTC as collateral, and mint DSC stablecoins against that collateral.",
    icon: Coins,
  },
  {
    title: "Health Factor Risk Control",
    description:
      "Every position has a Health Factor. A higher value means the account is safer; a lower value means it may be liquidated.",
    icon: Gauge,
  },
  {
    title: "Liquidation Protection",
    description:
      "If a user's collateral value falls too much, the protocol allows liquidation to protect the system from bad debt.",
    icon: ShieldCheck,
  },
];

export function ProjectGuide() {
  return (
    <MotionCard>
      <Card id="project-guide" className="scroll-mt-20 overflow-hidden">
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-5" />
                Project Guide
              </CardTitle>

              <CardDescription>
                A guided introduction to the Decentralized StableCoin local demo.
              </CardDescription>
            </div>

            <Badge variant="outline" className="w-fit gap-1">
              <Sparkles className="size-3" />
              DeFi Stablecoin Demo
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl border bg-background">
                <LockKeyhole className="size-4 text-muted-foreground" />
              </div>

              <div>
                <p className="text-sm font-semibold">Project Overview</p>
                <p className="text-xs text-muted-foreground">
                  What this protocol is trying to demonstrate
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p>
                This demo shows the core lifecycle of an overcollateralized
                stablecoin protocol: users deposit WETH or WBTC as collateral,
                the protocol calculates the USD value through price feeds, users
                mint DSC against that collateral, and the Health Factor
                determines whether the position is safe, risky, or liquidatable.
              </p>
            </div>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-3">
            {overviewItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-xl border bg-muted/20 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg border bg-background">
                      <Icon className="size-4 text-muted-foreground" />
                    </div>

                    <p className="text-sm font-medium">{item.title}</p>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </MotionRevealList>

          <div className="rounded-lg border bg-background p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold">How to use this demo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Complete each action independently so the effect on your position is clear.
              </p>
            </div>

            <MotionRevealList className="grid gap-3 md:grid-cols-3">
              {guideItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-xl border bg-muted/20 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>

                    <p className="text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </MotionRevealList>
          </div>

          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground">In one sentence: </span>
            Collateral Deposit → Mint DSC → Monitor Health Factor → Repay /
            Redeem → Liquidation.
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
