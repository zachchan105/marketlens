"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { FEATURED_TICKERS } from "@/lib/tickers";

interface RecentStock {
  symbol: string;
  timestamp: number;
}

export function RecentStocks() {
  const [recentStocks, setRecentStocks] = useState<RecentStock[]>([]);

  useEffect(() => {
    // Read from localStorage
    const stored = localStorage.getItem("recentStocks");
    if (stored) {
      try {
        const parsed: RecentStock[] = JSON.parse(stored);
        // Show only the 5 most recent
        setRecentStocks(parsed.slice(0, 5));
      } catch {
        // Invalid data, ignore
      }
    }
  }, []);

  if (recentStocks.length === 0) {
    return (
      <div className="px-4 py-3 rounded-lg border border-border bg-card/30 backdrop-blur-sm lg:min-w-[300px]">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Eye className="size-4 flex-shrink-0" />
          <p className="text-xs lg:text-sm">Recently viewed stocks will appear here as you explore.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded-lg border border-border bg-card/30 backdrop-blur-sm lg:min-w-[300px]">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="size-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Recently Viewed
        </span>
      </div>
      
      {/* Desktop: Horizontal */}
      <div className="hidden lg:flex items-center gap-4">
        {recentStocks.map((recent) => {
          const ticker = FEATURED_TICKERS.find(t => t.symbol === recent.symbol);
          if (!ticker) return null;
          
          return (
            <Link
              key={recent.symbol}
              href={`/stocks/${recent.symbol}`}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity group"
            >
              <img
                src={`/logos/${recent.symbol}.png`}
                alt={recent.symbol}
                className="size-6 object-contain"
              />
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {recent.symbol}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Mobile: Compact list */}
      <div className="flex lg:hidden flex-wrap gap-2">
        {recentStocks.map((recent) => {
          const ticker = FEATURED_TICKERS.find(t => t.symbol === recent.symbol);
          if (!ticker) return null;
          
          return (
            <Link
              key={recent.symbol}
              href={`/stocks/${recent.symbol}`}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
            >
              <img
                src={`/logos/${recent.symbol}.png`}
                alt={recent.symbol}
                className="size-4 object-contain"
              />
              <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                {recent.symbol}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

