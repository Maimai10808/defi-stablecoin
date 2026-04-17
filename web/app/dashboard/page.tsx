"use client";

import { useProtocolContracts } from "@/hooks/useProtocolContracts";

export default function DashboardPage() {
  const { chainId, contracts, isSupportedChain } = useProtocolContracts();

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div>chainId: {chainId ?? "not connected"}</div>
      <div>supported: {String(isSupportedChain)}</div>
      <pre className="rounded border p-4 text-sm overflow-x-auto">
        {JSON.stringify(contracts, null, 2)}
      </pre>
    </main>
  );
}
