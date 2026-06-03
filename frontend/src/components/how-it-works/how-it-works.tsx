"use client";

import { ArrowRight, Code2, Database, FileCode2, Wallet } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MotionCard, MotionProtocolBeam, MotionRevealList } from "@/components/motion";

const flowItems = [
  {
    title: "Foundry Contracts",
    description:
      "Deploy DSCEngine, DSC token, mock collateral tokens, and mock price feeds on Anvil.",
    icon: FileCode2,
  },
  {
    title: "Address and ABI Sync",
    description:
      "Sync deployed addresses and contract ABIs into the frontend constants and ABI folders.",
    icon: Database,
  },
  {
    title: "Wagmi Codegen",
    description:
      "Generate typed React hooks from ABI and contract addresses for frontend reads and writes.",
    icon: Code2,
  },
  {
    title: "Next.js Dashboard",
    description:
      "Use generated hooks to build wallet, protocol status, position, risk, and action panels.",
    icon: Wallet,
  },
];

export function HowItWorks() {
  return (
    <MotionCard>
      <Card id="how-it-works" className="scroll-mt-20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="size-5" />
          How It Works
        </CardTitle>
        <CardDescription>
          How the local chain, contracts, generated hooks, and UI work together.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <MotionProtocolBeam
          labels={["Foundry", "Sync", "Wagmi", "Dashboard"]}
          className="mb-4"
        />

        <MotionRevealList className="grid gap-3 lg:grid-cols-4">
          {flowItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="relative">
                <div className="h-full rounded-xl border bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {index < flowItems.length - 1 ? (
                  <ArrowRight className="absolute -right-5 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground lg:block" />
                ) : null}
              </div>
            );
          })}
        </MotionRevealList>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
