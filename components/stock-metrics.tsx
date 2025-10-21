import { Card } from "./ui/card";
import { CompanyOverview, DailyPrice, formatMarketCap } from "@/lib/normalize";

interface StockMetricsProps {
  overview: CompanyOverview;
  latestPrice: DailyPrice;
}

export function StockMetrics({ overview, latestPrice }: StockMetricsProps) {
  const metrics = [
    { label: "Market Cap", value: formatMarketCap(overview.marketCap) },
    { label: "P/E Ratio", value: overview.peRatio === "None" ? "N/A" : overview.peRatio },
    {
      label: "Dividend Yield",
      value: overview.dividendYield === "None" ? "N/A" : overview.dividendYield,
    },
    {
      label: "Volume",
      value: new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(latestPrice.volume),
    },
    { label: "Day's High", value: `$${latestPrice.high.toFixed(2)}` },
    { label: "Day's Low", value: `$${latestPrice.low.toFixed(2)}` },
    {
      label: "52 Week High",
      value: overview.high52Week === "None" ? "N/A" : `$${overview.high52Week}`,
    },
    { label: "52 Week Low", value: overview.low52Week === "None" ? "N/A" : `$${overview.low52Week}` },
  ];

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Key Metrics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-lg font-semibold text-foreground">{metric.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

