"use client";

import { AccountPositionOverview } from "./AccountPositionOverview";
import { OraclePricePanel } from "./OraclePricePanel";
import { ProtocolExplainer } from "./ProtocolExplainer";
import { ProtocolFlowTabs } from "./ProtocolFlowTabs";

export function ProtocolWorkspace() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
        <ProtocolExplainer />
        <AccountPositionOverview />
      </div>
      <OraclePricePanel />
      <ProtocolFlowTabs />
    </div>
  );
}
