import { ThemeToggle } from "@/components/theme-toggle";
import { TrendingUp } from "lucide-react";
import { FEATURED_TICKERS } from "@/lib/tickers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
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

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 text-balance">Market Overview</h2>
          <p className="text-muted-foreground text-pretty">
            Click any stock to view detailed analysis and historical performance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {FEATURED_TICKERS.map((ticker) => (
            <Link key={ticker.symbol} href={`/stocks/${ticker.symbol}`}>
              <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center gap-3">
                    <img
                      src={`/logos/${ticker.symbol}.png`}
                      alt={`${ticker.name} logo`}
                      className="size-16 object-contain transition-all group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(15,241,206,0.6)]"
                    />
                    <div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                        {ticker.symbol}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {ticker.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {ticker.sector}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
