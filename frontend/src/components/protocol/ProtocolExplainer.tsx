import { ArrowRight, Workflow } from "lucide-react";
import {useTranslations} from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = ["deposit", "mint", "monitor", "repay", "liquidation"] as const;

export function ProtocolExplainer() {
  const t = useTranslations("ProtocolFlow");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="size-4" />
          {t("lifecycleTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
          {t("lifecycleDescription")}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <Badge variant="outline">{t(`steps.${step}`)}</Badge>
              {index < steps.length - 1 ? <ArrowRight className="size-3 text-muted-foreground" /> : null}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
