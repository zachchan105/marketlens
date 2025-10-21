import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { DailyPrice } from "@/lib/normalize";

export function PriceHistory({ prices }: { prices: DailyPrice[] }) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Price History</h2>
      <div className="overflow-x-auto">
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
                <tr key={price.date} className="border-b border-border last:border-0">
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

