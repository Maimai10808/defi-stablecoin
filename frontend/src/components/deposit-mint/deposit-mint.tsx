"use client";

import {
  ArrowRightLeft,
  CircleAlert,
  Coins,
  Database,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useDepositMint } from "@/hooks/use-deposit-mint";
import { formatTokenAmount, formatDscSupply, shortAddress } from "@/lib/format";

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

export function DepositMint() {
  const { wallet, form, tokens, selectedToken, status, actions } =
    useDepositMint();

  return (
    <Card id="deposit-mint" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-5" />
              Deposit & Mint
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
              <ShieldCheck className="size-3" />
            ) : (
              <CircleAlert className="size-3" />
            )}
            {wallet.isConnected ? "Wallet Connected" : "Connect Wallet"}
          </Badge>
        </div>

        {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read collateral data. Please check whether Anvil is
            running, contracts are deployed, and your wallet is on the local
            network.
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-xl border bg-muted/20 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Connected Account</p>
              <p className="mt-1 font-mono text-sm text-muted-foreground">
                {shortAddress(wallet.address)}
              </p>
            </div>

            <Badge variant="outline">
              {wallet.hasWallet ? "Ready" : "No Wallet"}
            </Badge>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Coins className="size-4" />
              <h3 className="text-sm font-medium">Deposit Collateral</h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Collateral Token
              </label>

              <div className="grid gap-2 sm:grid-cols-2">
                {tokens.map((token) => (
                  <Button
                    key={token.symbol}
                    type="button"
                    variant={
                      form.collateralToken === token.symbol
                        ? "default"
                        : "outline"
                    }
                    className="justify-start"
                    disabled={!wallet.hasWallet || !token.isAvailable}
                    onClick={() =>
                      actions.updateField("collateralToken", token.symbol)
                    }
                  >
                    <span>{token.symbol}</span>
                    <span className="ml-auto text-xs opacity-70">
                      {token.isAvailable ? "Available" : "Missing"}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Collateral Amount
                </label>
                <Input
                  value={form.collateralAmount}
                  onChange={(event) =>
                    actions.updateField("collateralAmount", event.target.value)
                  }
                  placeholder="1"
                  inputMode="decimal"
                  disabled={!wallet.hasWallet}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  DSC Amount to Mint
                </label>
                <Input
                  value={form.dscAmountToMint}
                  onChange={(event) =>
                    actions.updateField("dscAmountToMint", event.target.value)
                  }
                  placeholder="500"
                  inputMode="decimal"
                  disabled={!wallet.hasWallet}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant={status.needsApproval ? "default" : "outline"}
                disabled={
                  !wallet.hasWallet ||
                  !selectedToken?.isAvailable ||
                  status.isApproving ||
                  status.isDepositing ||
                  !status.needsApproval
                }
                onClick={actions.approveSelectedToken}
              >
                {status.isApproving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Approve {form.collateralToken}
              </Button>

              <Button
                type="button"
                disabled={
                  !wallet.hasWallet ||
                  !selectedToken?.isAvailable ||
                  status.isApproving ||
                  status.isDepositing ||
                  status.needsApproval
                }
                onClick={actions.depositCollateralAndMintDsc}
              >
                {status.isDepositing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Deposit & Mint
              </Button>
            </div>

            {status.needsApproval ? (
              <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Approval is required before DSCEngine can transfer your{" "}
                {form.collateralToken}.
              </div>
            ) : null}
          </div>

          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Database className="size-4" />
              <h3 className="text-sm font-medium">Selected Token Data</h3>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Token</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedToken?.symbol ?? "Not selected"}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="mt-1 text-sm font-medium">
                  {formatTokenAmount(
                    selectedToken?.walletBalance,
                    selectedToken?.symbol,
                  )}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Deposited Amount
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatTokenAmount(
                    selectedToken?.depositedAmount,
                    selectedToken?.symbol,
                  )}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Engine Allowance
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatTokenAmount(
                    selectedToken?.allowance,
                    selectedToken?.symbol,
                  )}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  DSC to be Minted
                </p>
                <p className="mt-1 text-sm font-medium">
                  {form.dscAmountToMint
                    ? `${Number(form.dscAmountToMint).toLocaleString()} DSC`
                    : "Not set"}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">Token Address</p>
                <p className="mt-1 font-mono text-xs">
                  {shortAddress(selectedToken?.tokenAddress)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
          <Wallet className="mt-0.5 size-4 shrink-0" />
          <p>
            This panel writes to the DSCEngine contract. The normal flow is:
            mint mock collateral from Faucet, approve DSCEngine, then deposit
            collateral and mint DSC.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
