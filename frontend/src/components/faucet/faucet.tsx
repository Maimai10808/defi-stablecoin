"use client";

import {
  CircleAlert,
  Coins,
  Droplets,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";

import { useFaucet } from "@/hooks/use-faucet";
import { shortAddress } from "@/lib/format";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  MotionCard,
  MotionCopyButton,
  MotionPressable,
  MotionRevealList,
} from "@/components/motion";

export function Faucet() {
  const { wallet, tokens, amounts, status, actions } = useFaucet();

  return (
    <MotionCard>
      <Card id="faucet" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="size-5" />
              Faucet
            </CardTitle>
            <CardDescription>
              Decentralized StableCoin local demo dashboard.
            </CardDescription>
          </div>

          <Badge
            variant={wallet.isConnected ? "default" : "secondary"}
            className="gap-1"
          >
            {wallet.isConnected ? (
              <Wallet className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {wallet.isConnected ? "Wallet Connected" : "Connect Wallet"}
          </Badge>
        </div>

        {!wallet.isConnected ? (
          <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Connect your wallet first, then mint local mock collateral tokens.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Recipient Wallet</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {shortAddress(wallet.address)}
              </p>
            </div>

            <Badge variant="outline">
              {wallet.hasWallet ? "Ready to Mint" : "No Wallet"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Coins className="size-4" />
            <h3 className="text-sm font-medium">Mint Test Collateral</h3>
          </div>

          <MotionRevealList className="grid gap-3 md:grid-cols-2">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="rounded-xl border bg-muted/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {token.name}
                    </p>
                  </div>

                  <Badge variant={token.isAvailable ? "outline" : "secondary"}>
                    {token.isAvailable ? "Available" : "Missing"}
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">
                  {token.description}
                </p>

                <div className="mt-4 space-y-2">
                  <label className="text-xs text-muted-foreground">
                    Mint Amount
                  </label>

                  <div className="flex gap-2">
                    <Input
                      value={amounts[token.symbol]}
                      onChange={(event) =>
                        actions.updateAmount(token.symbol, event.target.value)
                      }
                      placeholder={token.defaultAmount}
                      inputMode="decimal"
                      disabled={!wallet.hasWallet || !token.isAvailable}
                    />

                    <MotionPressable
                      disabled={
                        !wallet.hasWallet ||
                        !token.isAvailable ||
                        status.isMinting
                      }
                    >
                      <Button
                        type="button"
                        onClick={() => actions.mintToken(token.symbol)}
                        disabled={
                          !wallet.hasWallet ||
                          !token.isAvailable ||
                          status.isMinting
                        }
                      >
                        {status.isMinting ? (
                          <Loader2 className="mr-2 size-4 animate-spin" />
                        ) : null}
                        Mint
                      </Button>
                    </MotionPressable>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border bg-background/50 px-3 py-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Token Address
                      </p>
                      <p className="mt-1 font-mono text-xs">
                        {shortAddress(token.tokenAddress)}
                      </p>
                    </div>

                    <MotionCopyButton
                      value={token.tokenAddress}
                      label="Copy"
                      className="shrink-0 border-transparent px-2 py-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </MotionRevealList>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            Faucet only works on the local Anvil demo network because these
            tokens are mock ERC20 contracts.
          </div>

          <MotionPressable>
            <Button type="button" variant="outline" size="sm" asChild>
              <a href="#deposit-mint">
                Go to Deposit
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          </MotionPressable>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
