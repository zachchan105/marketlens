"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, ArrowLeft, AlertCircle, AlertTriangle } from "lucide-react";
import { MarketLensLoader } from "@/components/market-lens-loader";
import { cn } from "@/lib/utils";
import { StockChart } from "@/components/stock-chart";
import { StockMetrics } from "@/components/stock-metrics";
import { PriceHistory } from "@/components/price-history";
import { CompanyOverview, DailyPrice } from "@/lib/normalize";
import { ThemeToggle } from "@/components/theme-toggle";
import { DataFreshnessBadge } from "@/components/data-freshness-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CacheMetadata } from "@/lib/cache";
import { FEATURED_TICKERS } from "@/lib/tickers";
import { AnimatedBackground } from "@/components/animated-background";

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const symbol = (params?.symbol as string)?.toUpperCase();

  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [prices, setPrices] = useState<DailyPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    overview?: CacheMetadata;
    prices?: CacheMetadata;
  }>({});

  // Validate symbol against featured tickers
  useEffect(() => {
    if (!symbol) return;
    
    const isValidSymbol = FEATURED_TICKERS.some(
      (ticker) => ticker.symbol === symbol
    );
    
    if (!isValidSymbol) {
      router.push('/');
      return;
    }

    // Track recent view in localStorage
    try {
      const stored = localStorage.getItem('recentStocks');
      let recentStocks: Array<{ symbol: string; timestamp: number }> = [];
      
      if (stored) {
        recentStocks = JSON.parse(stored);
      }
      
      // Remove existing entry for this symbol
      recentStocks = recentStocks.filter(s => s.symbol !== symbol);
      
      // Add to front
      recentStocks.unshift({ symbol, timestamp: Date.now() });
      
      // Keep only last 10
      recentStocks = recentStocks.slice(0, 10);
      
      localStorage.setItem('recentStocks', JSON.stringify(recentStocks));
    } catch (error) {
      // localStorage might be disabled, fail silently
    }
  }, [symbol, router]);

  useEffect(() => {
    if (!symbol) return;

    // Skip fetch if symbol is invalid
    const isValidSymbol = FEATURED_TICKERS.some(
      (ticker) => ticker.symbol === symbol
    );
    if (!isValidSymbol) return;

    async function fetchData() {
      try {
        const [overviewRes, pricesRes] = await Promise.all([
          fetch(`/api/overview?symbol=${symbol}`),
          fetch(`/api/prices?symbol=${symbol}`),
        ]);

        const overviewData = await overviewRes.json();
        const pricesData = await pricesRes.json();

        if (overviewData.error || pricesData.error) {
          throw new Error(
            overviewData.error || pricesData.error || 'Failed to fetch stock data'
          );
        }

        if (!overviewData.data || !pricesData.data) {
          throw new Error('No data available - API rate limit may have been reached');
        }

        setOverview(overviewData.data);
        setPrices(pricesData.data);
        setMetadata({
          overview: overviewData.metadata,
          prices: pricesData.metadata,
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* Animated grid background */}
        <AnimatedBackground />
        
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" disabled className="-ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Market
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex items-center justify-center min-h-[60vh]">
            <MarketLensLoader size="lg" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    const isRateLimit = error.includes('rate limit') || error.includes('25 requests');
    
    return (
      <div className="min-h-screen bg-background relative">
        {/* Animated grid background */}
        <AnimatedBackground />
        
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="-ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Market
            </Button>
            <ThemeToggle />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">
              {isRateLimit ? 'Data temporarily unavailable' : 'Unable to load stock data'}
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              {isRateLimit 
                ? "We've reached today's data request limit. Some information may still be shown from cache — new data will be available automatically after midnight (UTC)."
                : error}
            </p>
            <Button onClick={() => router.push('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!overview || !prices || prices.length < 2) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative">
        {/* Animated grid background */}
        <AnimatedBackground />
        <div className="text-center relative z-10">
          <p className="text-muted-foreground mb-4">Unable to load stock data</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const latestPrice = prices[0];
  const previousPrice = prices[1];
  const changeAmount = latestPrice.close - previousPrice.close;
  const changePercent = (changeAmount / previousPrice.close) * 100;
  const isPositive = changePercent >= 0;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated grid background */}
      <AnimatedBackground />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Market
          </Button>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="space-y-6">
          {/* Rate Limit Alert - only show if data is actually stale */}
          {metadata.prices?.isStale && metadata.prices.age > 60000 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Using cached data from{" "}
                {new Date(metadata.prices.fetchedAt).toLocaleString()}.
                API rate limit may have been reached (25 requests/day).
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                  <img src={`/logos/${symbol}.png`} alt={symbol} className="size-14 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-foreground">{symbol}</h1>
                    {metadata.prices && (
                      <DataFreshnessBadge
                        fetchedAt={metadata.prices.fetchedAt}
                        age={metadata.prices.age}
                        isStale={metadata.prices.isStale}
                      />
                    )}
                  </div>
                  <p className="text-muted-foreground">{overview.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {overview.exchange} • {overview.sector}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Price</p>
                <p className="text-4xl font-bold text-foreground">${latestPrice.close.toFixed(2)}</p>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg mb-1",
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 text-red-600 dark:text-red-400"
                )}
              >
                {isPositive ? <TrendingUp className="size-5" /> : <TrendingDown className="size-5" />}
                <span className="font-semibold">
                  {isPositive ? "+" : ""}${changeAmount.toFixed(2)} ({isPositive ? "+" : ""}
                  {changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </Card>

          {/* About */}
          {overview.description !== "N/A" && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">About {overview.name}</h2>
              <p className="text-muted-foreground leading-relaxed text-pretty">{overview.description}</p>
            </Card>
          )}

          {/* Chart */}
          <StockChart prices={prices} symbol={symbol} />

          {/* Metrics */}
          <StockMetrics overview={overview} latestPrice={latestPrice} />

          {/* Price History Table */}
          <PriceHistory prices={prices.slice(0, 30)} />
        </div>
      </main>
    </div>
  );
}
