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
  Workflow,
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
    title: "Deposit and Mint",
    description:
      "Deposit collateral into DSCEngine and mint DSC based on your collateral value.",
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
  {
    title: "Full DeFi Lifecycle",
    description:
      "The demo covers deposit, mint, burn, redeem, price-feed valuation, health-factor checks, and liquidation flow.",
    icon: Workflow,
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
          <div className="rounded-2xl border bg-muted/20 p-5">
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
                This project is an overcollateralized decentralized stablecoin
                protocol demo. In simple terms, users deposit crypto assets such
                as WETH or WBTC into the smart contract as collateral, and the
                protocol allows them to mint DSC stablecoins based on the USD
                value of that collateral.
              </p>

              <p>
                DSC is designed to stay close to 1 USD, but it is not backed by
                money in a bank account. Instead, it is backed by collateral
                locked on-chain. The protocol uses price feeds to calculate the
                dollar value of each user&apos;s collateral position.
              </p>

              <p>
                The core idea is risk control. Users cannot mint unlimited DSC.
                Each account has a Health Factor, which measures whether the
                collateral is enough to cover the debt. If the Health Factor
                becomes too low, the position becomes risky and can be
                liquidated by another user.
              </p>
            </div>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="rounded-2xl border bg-background p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold">How to use this demo</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Follow these steps to complete the local stablecoin protocol flow.
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
            this demo shows how a DeFi protocol can use collateral deposits,
            Chainlink-style price feeds, health-factor checks, and liquidation
            rules to support the minting and risk management of an
            overcollateralized stablecoin.
          </div>
        </CardContent>
      </Card>
    </MotionCard>
  );
}
