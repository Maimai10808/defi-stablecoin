"use client";

import { CircleAlert, Loader2, LockKeyhole, WalletCards } from "lucide-react";

import { MotionNumberText, MotionPressable } from "@/components/motion";
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
import { Label } from "@/components/ui/label";
import { useDepositMint } from "@/hooks/use-deposit-mint";
import { formatTokenAmount } from "@/lib/format";

import { bigintToNumber, parsePositiveAmount } from "./protocol-calculations";

export function CollateralDepositPanel() {
  const {
    wallet,
    form,
    tokens,
    selectedToken,
    selectedAllowance,
    preview,
    status,
    actions,
  } = useDepositMint();
  const amount = parsePositiveAmount(form.collateralAmount);
  const estimatedUsdValue = bigintToNumber(preview.collateralUsdValue);
  const walletBalance =
    selectedToken?.walletBalance === undefined
      ? 0
      : Number(selectedToken.walletBalance) / 1e18;
  const insufficientBalance = amount > walletBalance && amount > 0;
  const isSubmitting =
    status.isApproving ||
    status.isDepositing ||
    status.isGuidedDepositPending;
  const canSubmit =
    wallet.hasWallet &&
    amount > 0 &&
    !insufficientBalance &&
    selectedAllowance !== undefined &&
    !isSubmitting;

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <WalletCards className="size-4" />
              Deposit Collateral
            </CardTitle>
            <CardDescription>
              Lock WETH or WBTC in DSCEngine. This action does not mint DSC.
            </CardDescription>
          </div>
          <Badge variant="outline">Step 1</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-2 sm:grid-cols-2">
          {tokens.map((token) => (
            <Button
              key={token.symbol}
              type="button"
              variant={form.collateralToken === token.symbol ? "default" : "outline"}
              disabled={!wallet.hasWallet || !token.isAvailable}
              onClick={() => actions.updateField("collateralToken", token.symbol)}
            >
              {token.symbol}
              <span className="ml-auto text-xs opacity-70">
                {formatTokenAmount(token.walletBalance)}
              </span>
            </Button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit-collateral-amount">Collateral amount</Label>
          <Input
            id="deposit-collateral-amount"
            value={form.collateralAmount}
            inputMode="decimal"
            placeholder="1.0"
            disabled={!wallet.hasWallet}
            onChange={(event) => actions.updateField("collateralAmount", event.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="Selected token" value={form.collateralToken} />
          <Metric label="Estimated USD value">
            <MotionNumberText value={estimatedUsdValue} prefix="$" decimals={2} />
          </Metric>
          <Metric
            label="Already deposited"
            value={formatTokenAmount(selectedToken?.depositedAmount, form.collateralToken)}
          />
        </div>

        {!wallet.hasWallet ? (
          <Notice>Connect Wallet to deposit collateral.</Notice>
        ) : insufficientBalance ? (
          <Notice destructive>
            Insufficient {form.collateralToken} balance.
          </Notice>
        ) : status.needsApproval ? (
          <Notice>
            One guided action will request approval first, then deposit{" "}
            {form.collateralToken}. Your wallet will confirm both transactions.
          </Notice>
        ) : null}

        <MotionPressable disabled={!canSubmit}>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={() => actions.approveAndDepositSelectedCollateral()}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : status.needsApproval ? (
              <LockKeyhole className="size-4" />
            ) : null}
            {status.isApproving
              ? `Approving ${form.collateralToken}...`
              : status.isDepositing
                ? "Depositing Collateral..."
                : status.needsApproval
                  ? `Approve & Deposit ${form.collateralToken}`
                  : "Deposit Collateral"}
          </Button>
        </MotionPressable>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-base font-semibold">{children ?? value}</div>
    </div>
  );
}

function Notice({ children, destructive = false }: { children: React.ReactNode; destructive?: boolean }) {
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${destructive ? "border-destructive/30 bg-destructive/5 text-destructive" : "bg-muted/20 text-muted-foreground"}`}>
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {children}
    </div>
  );
}
