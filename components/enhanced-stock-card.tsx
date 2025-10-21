"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMarketCap } from "@/lib/normalize";
import { Badge } from "@/components/ui/badge";

interface EnhancedStockCardProps {
  symbol: string;
  name: string;
  sector: string;
  showEmptyState?: boolean;
  cachedData?: {
    marketCap: string;
    peRatio: string;
    dividendYield: string;
    sector: string;
    industry: string;
    exchange: string;
    priceData?: {
      price: number;
      timestamp: number;
    } | null;
  } | null;
}

export function EnhancedStockCard({ symbol, name, sector, cachedData, showEmptyState = false }: EnhancedStockCardProps) {
  const hasData = cachedData !== null && cachedData !== undefined;

  return (
    <Link href={`/stocks/${symbol}`}>
      <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg hover:border-primary/50 h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={`/logos/${symbol}.png`}
                alt={`${name} logo`}
                className="size-10 object-contain transition-all group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(15,241,206,0.6)]"
              />
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {symbol}
                </h3>
                <p className="text-xs text-muted-foreground capitalize">{sector}</p>
              </div>
            </div>

            {/* Price and badge on the right */}
            {hasData && cachedData.priceData && (
              <div className="text-right">
                <div className="text-xl font-bold text-foreground">
                  ${cachedData.priceData.price.toFixed(2)}
                </div>
                <Badge variant="secondary" className="gap-1 mt-1">
                  <Clock className="size-3" />
                  <span className="text-xs">
                    {(() => {
                      const age = Date.now() - cachedData.priceData.timestamp;
                      const hours = Math.floor(age / 3600000);
                      const days = Math.floor(age / 86400000);
                      if (age < 3600000) return `${Math.floor(age / 60000)}m ago`;
                      if (hours < 24) return `${hours}h ago`;
                      return `${days}d ago`;
                    })()}
                  </span>
                </Badge>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">{name}</p>
            
            {hasData ? (
              <div className="space-y-2 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Market Cap</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatMarketCap(cachedData.marketCap)}
                  </p>
                </div>
                {cachedData.peRatio && cachedData.peRatio !== 'None' && cachedData.peRatio !== '-' && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">P/E Ratio</p>
                    <p className="text-sm font-semibold text-foreground">
                      {parseFloat(cachedData.peRatio).toFixed(2)}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Dividend</p>
                  <p className="text-sm font-semibold text-foreground">
                    {cachedData.dividendYield && cachedData.dividendYield !== 'None' && cachedData.dividendYield !== '0'
                      ? `${(parseFloat(cachedData.dividendYield) * 100).toFixed(2)}%`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            ) : showEmptyState ? (
              <div className="pt-3 border-t border-border">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30">
                  <Search className="size-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="font-medium text-foreground mb-1">Data not yet available</p>
                    <p>Click anytime to check this stock's latest insights as they come into focus.</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

