"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";

type PricePoint = {
  time: string;
  price: number;
};

type VirtualPriceChartProps = {
  tokenSymbol?: string;
  onPriceChange?: (price: number) => void;
};

const BASE_PRICE_MAP: Record<string, number> = {
  WETH: 2000,
  WBTC: 42000,
};

const VOLATILITY_MAP: Record<string, number> = {
  WETH: 0.012,
  WBTC: 0.008,
};

function getBasePrice(tokenSymbol: string) {
  return BASE_PRICE_MAP[tokenSymbol] ?? BASE_PRICE_MAP.WETH;
}

function getVolatility(tokenSymbol: string) {
  return VOLATILITY_MAP[tokenSymbol] ?? VOLATILITY_MAP.WETH;
}

function getNextPrice(previousPrice: number, tokenSymbol: string) {
  const volatility = getVolatility(tokenSymbol);

  const randomNoise = (Math.random() - 0.5) * 2 * volatility;
  const softTrend = Math.sin(Date.now() / 14000) * 0.0018;
  const nextPrice = previousPrice * (1 + randomNoise + softTrend);

  return Math.max(nextPrice, 1);
}

function createInitialPriceHistory(tokenSymbol: string): PricePoint[] {
  const basePrice = getBasePrice(tokenSymbol);

  return Array.from({ length: 24 }, (_, index) => {
    const wave = Math.sin(index / 3) * 0.012;
    const noise = (Math.random() - 0.5) * 0.012;
    const price = basePrice * (1 + wave + noise);

    return {
      time: `${index + 1}`,
      price: Number(price.toFixed(2)),
    };
  });
}

function formatUsdPrice(value: number) {
  return `$${value.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

export function VirtualPriceChart({
  tokenSymbol = "WETH",
  onPriceChange,
}: VirtualPriceChartProps) {
  const [priceHistory, setPriceHistory] = React.useState<PricePoint[]>(() =>
    createInitialPriceHistory(tokenSymbol),
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPriceHistory(createInitialPriceHistory(tokenSymbol));
  }, [tokenSymbol]);

  const latestPrice = priceHistory[priceHistory.length - 1]?.price ?? 0;
  const previousPrice =
    priceHistory[priceHistory.length - 2]?.price ?? latestPrice;

  React.useEffect(() => {
    if (latestPrice > 0) {
      onPriceChange?.(latestPrice);
    }
  }, [latestPrice, onPriceChange]);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setPriceHistory((currentHistory) => {
        const lastPrice =
          currentHistory[currentHistory.length - 1]?.price ??
          getBasePrice(tokenSymbol);

        const nextPrice = getNextPrice(lastPrice, tokenSymbol);

        const nextPoint: PricePoint = {
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          price: Number(nextPrice.toFixed(2)),
        };

        return [...currentHistory.slice(-31), nextPoint];
      });
    }, 2500);

    return () => window.clearInterval(timer);
  }, [tokenSymbol]);

  const priceChange = latestPrice - previousPrice;
  const priceChangePercent =
    previousPrice > 0 ? (priceChange / previousPrice) * 100 : 0;

  const isUp = priceChange >= 0;

  return (
    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="size-4" />
            <h3 className="text-sm font-medium">
              Virtual Collateral Market Price
            </h3>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Simulated live price used only for the current deposit preview.
          </p>
        </div>

        <Badge variant="outline" className="gap-1">
          <TrendingUp className="size-3" />
          {tokenSymbol}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border bg-background/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Current Unit Price</p>
          <p className="mt-1 text-lg font-semibold">
            {formatUsdPrice(latestPrice)}
          </p>
        </div>

        <div className="rounded-lg border bg-background/50 px-3 py-2">
          <p className="text-xs text-muted-foreground">Last Tick</p>
          <p className="mt-1 text-lg font-semibold">
            {isUp ? "+" : ""}
            {priceChangePercent.toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={priceHistory}>
            <defs>
              <linearGradient
                id={`price-fill-${tokenSymbol}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                <stop
                  offset="95%"
                  stopColor="currentColor"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />

            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tick={{ fontSize: 11 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              domain={["dataMin - 50", "dataMax + 50"]}
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
            />

            <Tooltip
              formatter={(value) => [
                formatUsdPrice(Number(value)),
                `${tokenSymbol} Unit Price`,
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke="currentColor"
              fill={`url(#price-fill-${tokenSymbol})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        This virtual price does not rewrite contract state. It only estimates
        the USD value of the collateral amount you are about to deposit.
      </p>
    </div>
  );
}
