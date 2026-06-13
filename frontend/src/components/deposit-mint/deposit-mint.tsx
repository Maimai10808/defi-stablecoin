"use client";

import * as React from "react";
import {
  ArrowRightLeft,
  CircleAlert,
  Coins,
  Database,
  Loader2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { VirtualPriceChart } from "@/components/virtual-price-chart";
import { useDepositMint } from "@/hooks/use-deposit-mint";
import { formatTokenAmount, shortAddress } from "@/lib/format";

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
  MotionErrorShake,
  MotionNumberText,
  MotionPressable,
} from "@/components/motion";

const LIQUIDATION_THRESHOLD = 0.5;
const SAFE_MINT_RATIO = 0.8;

function formatUsd(value: number) {
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function formatDscPreview(value: number) {
  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })} DSC`;
}

function parseAmount(value: string) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    return 0;
  }

  return parsedValue;
}

export function DepositMint() {
  const { wallet, form, tokens, selectedToken, status, actions } =
    useDepositMint();

  const [virtualPrice, setVirtualPrice] = React.useState(0);

  const selectedSymbol = selectedToken?.symbol ?? form.collateralToken;

  const depositCollateralAmount = parseAmount(form.collateralAmount);
  const dscAmountToMint = parseAmount(form.dscAmountToMint);

  /**
   * 这里的价格只作用于“本次准备存入的抵押物”。
   * 它不影响钱包余额、不影响已存入数量、不影响链上健康因子。
   */
  const depositCollateralValueUsd = depositCollateralAmount * virtualPrice;

  /**
   * 根据本次存入的抵押物价值，估算理论最大可铸造 DSC。
   * 当前协议阈值按 50% 计算，也就是 1,000 美元抵押物最多支持 500 DSC。
   */
  const maxMintableDscFromDeposit =
    depositCollateralValueUsd * LIQUIDATION_THRESHOLD;

  /**
   * 建议安全铸造量不是协议强制值，只是 UI 给用户看的保守参考。
   */
  const suggestedSafeMintDsc = maxMintableDscFromDeposit * SAFE_MINT_RATIO;

  /**
   * 这里是“本次操作预览健康因子”，不是链上真实健康因子。
   * 只用于判断这一次输入是否过激。
   */
  const previewHealthFactor =
    dscAmountToMint > 0
      ? maxMintableDscFromDeposit / dscAmountToMint
      : undefined;

  const isMintTooHigh =
    dscAmountToMint > 0 &&
    maxMintableDscFromDeposit > 0 &&
    dscAmountToMint > maxMintableDscFromDeposit;

  return (
    <MotionCard>
      <Card id="deposit-mint" className="scroll-mt-20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="size-5" />
              Deposit & Mint
            </CardTitle>

            <CardDescription>
              Deposit collateral into DSCEngine and mint DSC against your
              position.
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

        <MotionErrorShake trigger={status.hasReadError}>
          {status.hasReadError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Failed to read collateral data. Please check whether Anvil is
            running, contracts are deployed, and your wallet is on the local
            network.
          </div>
          ) : null}
        </MotionErrorShake>
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

        <VirtualPriceChart
          tokenSymbol={selectedSymbol}
          onPriceChange={setVirtualPrice}
        />

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              Current Unit Price
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              <MotionNumberText value={virtualPrice} prefix="$" decimals={2} />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Simulated price for 1 {selectedSymbol}.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              This Deposit Value
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              <MotionNumberText
                value={depositCollateralValueUsd}
                prefix="$"
                decimals={2}
              />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {depositCollateralAmount || 0} {selectedSymbol} × current price.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">
              Max Mint From Deposit
            </p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              <MotionNumberText
                value={maxMintableDscFromDeposit}
                suffix=" DSC"
                decimals={2}
              />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Estimated with 50% liquidation threshold.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <p className="text-xs text-muted-foreground">Suggested Safe Mint</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              <MotionNumberText
                value={suggestedSafeMintDsc}
                suffix=" DSC"
                decimals={2}
              />
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              UI-only conservative suggestion.
            </p>
          </div>
        </div>

        {previewHealthFactor !== undefined ? (
          <div className="rounded-lg border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
            Preview Health Factor for this input:{" "}
            <span className="font-medium text-foreground">
              {previewHealthFactor.toFixed(2)}
            </span>
            . This is only a frontend preview, not the final on-chain health
            factor.
          </div>
        ) : null}

        <MotionErrorShake trigger={isMintTooHigh}>
          {isMintTooHigh ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Your mint amount is higher than the estimated max mintable DSC from
            this deposit. Reduce the DSC amount or deposit more collateral.
          </div>
          ) : null}
        </MotionErrorShake>

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
                  <MotionPressable
                    key={token.symbol}
                    disabled={!wallet.hasWallet || !token.isAvailable}
                  >
                    <Button
                      type="button"
                      variant={
                        form.collateralToken === token.symbol
                          ? "default"
                          : "outline"
                      }
                      className="w-full justify-start"
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
                  </MotionPressable>
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

                <p className="text-xs text-muted-foreground">
                  Estimated value:{" "}
                  <span className="font-medium text-foreground">
                    {formatUsd(depositCollateralValueUsd)}
                  </span>
                </p>
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

                <p className="text-xs text-muted-foreground">
                  Max from this deposit:{" "}
                  <span className="font-medium text-foreground">
                    {formatDscPreview(maxMintableDscFromDeposit)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <MotionPressable
                disabled={
                  !wallet.hasWallet ||
                  !selectedToken?.isAvailable ||
                  status.isApproving ||
                  status.isDepositing ||
                  !status.needsApproval
                }
              >
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
              </MotionPressable>

              <MotionPressable
                disabled={
                  !wallet.hasWallet ||
                  !selectedToken?.isAvailable ||
                  status.isApproving ||
                  status.isDepositing ||
                  status.isSigningPermit ||
                  !status.permitAvailable ||
                  isMintTooHigh
                }
              >
                <Button
                  type="button"
                  disabled={
                    !wallet.hasWallet ||
                    !selectedToken?.isAvailable ||
                    status.isApproving ||
                    status.isDepositing ||
                    status.isSigningPermit ||
                    !status.permitAvailable ||
                    isMintTooHigh
                  }
                  onClick={actions.depositCollateralAndMintDscWithPermit}
                >
                  {status.isDepositing || status.isSigningPermit ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : null}
                  Sign & Deposit + Mint
                </Button>
              </MotionPressable>
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
                  This Deposit Value
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatUsd(depositCollateralValueUsd)}
                </p>
              </div>

              <div className="rounded-lg border bg-background/50 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Max Mint From Deposit
                </p>
                <p className="mt-1 text-sm font-medium">
                  {formatDscPreview(maxMintableDscFromDeposit)}
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
            This panel writes to the DSCEngine contract. The virtual price only
            previews the USD value of the collateral you are about to deposit
            and the estimated DSC minting capacity for this operation.
          </p>
        </div>
      </CardContent>
      </Card>
    </MotionCard>
  );
}
