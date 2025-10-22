import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingUp } from "lucide-react";
import { FEATURED_TICKERS } from "@/lib/tickers";
import { EnhancedStockCard } from "@/components/enhanced-stock-card";
import { getCachedStockData } from "@/lib/cache-reader";
import { AnimatedBackground } from "@/components/animated-background";
import { RecentStocks } from "@/components/recent-stocks";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cachedData = await getCachedStockData(
    FEATURED_TICKERS.map(t => t.symbol)
  );
  
  const hasAnyCachedData = Object.values(cachedData).some(data => data !== null);
  return (
    <div className="min-h-screen bg-background relative">
      <AnimatedBackground />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="size-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">MarketLens</h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Market Overview</h2>
            <p className="text-muted-foreground text-pretty">
              Click any stock to view detailed analysis and historical performance
            </p>
          </div>
          
          <RecentStocks />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURED_TICKERS.map((ticker) => (
            <EnhancedStockCard
              key={ticker.symbol}
              symbol={ticker.symbol}
              name={ticker.name}
              sector={ticker.sector}
              cachedData={cachedData[ticker.symbol]}
              showEmptyState={hasAnyCachedData}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
