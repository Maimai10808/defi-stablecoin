import { ArrowRight, Workflow } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = ["Collateral Deposit", "Mint DSC", "Monitor Health Factor", "Repay / Redeem", "Liquidation"];

export function ProtocolExplainer() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="size-4" />
          Protocol Lifecycle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
          This demo shows the core lifecycle of an overcollateralized stablecoin
          protocol: users deposit WETH or WBTC as collateral, the protocol
          calculates the USD value through price feeds, users mint DSC against
          that collateral, and the Health Factor determines whether the position
          is safe, risky, or liquidatable.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <Badge variant="outline">{step}</Badge>
              {index < steps.length - 1 ? <ArrowRight className="size-3 text-muted-foreground" /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
