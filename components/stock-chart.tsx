"use client";

import { Card } from "./ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "next-themes";
import { DailyPrice } from "@/lib/normalize";

export function StockChart({ prices, symbol }: { prices: DailyPrice[]; symbol: string }) {
  const { theme } = useTheme();

  const chartData = prices
    .slice(0, 90)
    .reverse()
    .map((price) => ({
      date: new Date(price.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: price.close,
    }));

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const priceChange = chartData[chartData.length - 1].price - chartData[0].price;
  const isPositive = priceChange >= 0;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">Price Chart</h2>
        <p className="text-sm text-muted-foreground">Last 90 days</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <XAxis
            dataKey="date"
            stroke={theme === "dark" ? "#71717a" : "#a1a1aa"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={theme === "dark" ? "#71717a" : "#a1a1aa"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            domain={[minPrice * 0.95, maxPrice * 1.05]}
            tickFormatter={(value) => `$${value.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme === "dark" ? "oklch(0.12 0 0)" : "oklch(1 0 0)",
              border: `1px solid ${theme === "dark" ? "oklch(0.2 0 0)" : "oklch(0.92 0.005 180)"}`,
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{
              color: theme === "dark" ? "oklch(0.98 0 0)" : "oklch(0.09 0 0)",
              fontWeight: 600,
              marginBottom: "4px",
            }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={isPositive ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

