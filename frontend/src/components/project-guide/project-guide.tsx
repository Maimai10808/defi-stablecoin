"use client";

import { BookOpen, CheckCircle2, Layers, PlayCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

export function ProjectGuide() {
  return (
    <Card id="project-guide" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5" />
          Project Guide
        </CardTitle>
        <CardDescription>
          A guided introduction to the Decentralized StableCoin local demo.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border bg-muted/20 p-4">
          <p className="text-sm leading-6 text-muted-foreground">
            This dashboard is a local DeFi protocol demo. It connects a Next.js
            frontend with Foundry smart contracts, generated Wagmi hooks, mock
            collateral tokens, price feeds, and an optional Express backend for
            development data or activity records.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
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
        </div>
      </CardContent>
    </Card>
  );
}
