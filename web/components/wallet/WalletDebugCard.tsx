"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectCard() {
  return (
    <div className="rounded-2xl border p-4">
      <h2 className="text-lg font-semibold">Wallet</h2>
      <div className="mt-4">
        <ConnectButton />
      </div>
    </div>
  );
}
