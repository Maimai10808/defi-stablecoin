"use client";

import { OraclePricePanel } from "./OraclePricePanel";
import { ProtocolExplainer } from "./ProtocolExplainer";
import { ProtocolFlowTabs } from "./ProtocolFlowTabs";

export function ProtocolWorkspace() {
  return (
    <div className="w-full min-w-0 space-y-6">
      <ProtocolExplainer />
      <OraclePricePanel />
      <ProtocolFlowTabs />
    </div>
  );
}
