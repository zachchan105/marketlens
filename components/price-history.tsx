import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { DailyPrice } from "@/lib/normalize";
import { TrendingUp, TrendingDown } from "lucide-react";

export function PriceHistory({ prices }: { prices: DailyPrice[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Price History</h2>
      
      {/* Mobile view: Card-based layout */}
      <div className="block md:hidden space-y-3">
        {prices.map((price) => {
          const isPositive = (price.changePercent || 0) >= 0;
          
          return (
            <div 
              key={price.date} 
              className="border border-border rounded-lg p-4 bg-card/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {new Date(price.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-semibold",
                    isPositive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="size-4" />
                  ) : (
                    <TrendingDown className="size-4" />
                  )}
                  {price.changePercent !== undefined
                    ? `${isPositive ? "+" : ""}${price.changePercent.toFixed(2)}%`
                    : "—"}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Close</span>
                  <p className="font-semibold text-foreground text-base mt-1">
                    ${price.close.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Volume</span>
                  <p className="font-medium text-foreground mt-1">
                    {new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(price.volume)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">High / Low</span>
                  <p className="font-medium text-foreground mt-1">
                    ${price.high.toFixed(2)} / ${price.low.toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Open</span>
                  <p className="font-medium text-foreground mt-1">
                    ${price.open.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop view: Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Open</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">High</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Low</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Close</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Volume</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Change</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((price, index) => {
              const isPositive = (price.changePercent || 0) >= 0;

              return (
                <tr key={price.date} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">
                    {new Date(price.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">${price.open.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">${price.high.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-right text-foreground">${price.low.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-right font-medium text-foreground">
                    ${price.close.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-right text-muted-foreground">
                    {new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(price.volume)}
                  </td>
                  <td
                    className={cn(
                      "py-3 px-4 text-sm text-right font-medium",
                      isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    {price.changePercent !== undefined
                      ? `${isPositive ? "+" : ""}${price.changePercent.toFixed(2)}%`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

