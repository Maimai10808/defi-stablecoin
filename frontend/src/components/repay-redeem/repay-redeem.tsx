"use client";

import {
  ArrowDownUp,
  CircleAlert,
  Coins,
  Database,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useRepayRedeem } from "@/hooks/use-repay-redeem";
import { formatDscSupply, formatTokenAmount, shortAddress } from "@/lib/format";

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

export function RepayRedeem() {
  const { wallet, form, tokens, selectedToken, position, status, actions } =
    useRepayRedeem();

  return (
    <Card id="repay-redeem" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownUp className="size-5" />
              Repay & Redeem
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
            Failed to read repay and redeem data. Please check whether Anvil is
            running, contracts are deployed, and your wallet is connected to the
            local network.
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

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">DSC Wallet Balance</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              {formatDscSupply(position.dscWalletBalance)}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">DSC Minted Debt</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              {formatDscSupply(position.dscMintedAmount)}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              DSCEngine DSC Allowance
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              {formatDscSupply(position.dscEngineAllowance)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div className="flex items-center gap-2">
              <Coins className="size-4" />
              <h3 className="text-sm font-medium">Repay DSC & Redeem</h3>
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
                  Collateral Amount to Redeem
                </label>
                <Input
                  value={form.collateralAmount}
                  onChange={(event) =>
                    actions.updateField("collateralAmount", event.target.value)
                  }
                  placeholder="0.5"
                  inputMode="decimal"
                  disabled={!wallet.hasWallet}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  DSC Amount to Burn
                </label>
                <Input
                  value={form.dscAmountToBurn}
                  onChange={(event) =>
                    actions.updateField("dscAmountToBurn", event.target.value)
                  }
                  placeholder="250"
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
                  status.isApproving ||
                  status.isRedeeming ||
                  !status.needsApproval
                }
                onClick={actions.approveDscForEngine}
              >
                {status.isApproving ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Approve DSC
              </Button>

              <Button
                type="button"
                disabled={
                  !wallet.hasWallet ||
                  !selectedToken?.isAvailable ||
                  status.isApproving ||
                  status.isRedeeming ||
                  status.needsApproval
                }
                onClick={actions.repayAndRedeem}
              >
                {status.isRedeeming ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Repay & Redeem
              </Button>
            </div>

            {status.needsApproval ? (
              <div className="rounded-lg border border-muted-foreground/20 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                Approval is required before DSCEngine can burn your DSC.
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
                  Collateral to Redeem
                </p>
                <p className="mt-1 text-sm font-medium">
                  {form.collateralAmount
                    ? `${Number(form.collateralAmount).toLocaleString()} ${
                        selectedToken?.symbol ?? ""
                      }`
                    : "Not set"}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">DSC to Burn</p>
                <p className="mt-1 text-sm font-medium">
                  {form.dscAmountToBurn
                    ? `${Number(form.dscAmountToBurn).toLocaleString()} DSC`
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
            This panel performs the reverse flow of Deposit & Mint. Approve DSC
            first, then burn DSC debt and redeem the selected collateral from
            DSCEngine.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
