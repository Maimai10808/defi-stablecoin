"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function WalletConnectCard() {
  return (
    <div className="cyber-panel bg-[rgb(18_18_26_/_0.6)] p-4">
      <div className="cyber-subtitle">Wallet</div>
      <h2 className="cyber-title mt-2">Connect Terminal</h2>
      <div className="mt-4">
        <ConnectButton />
      </div>
    </div>
  );
}
