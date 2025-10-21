"use client";

import { cn } from "@/lib/utils";
import { getRandomQuote } from "@/lib/quotes";
import { useMemo } from "react";

interface MarketLensLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showQuote?: boolean;
}

export function MarketLensLoader({ className, size = "md", showQuote = true }: MarketLensLoaderProps) {
  // Generate quote once on mount to avoid flash
  const quote = useMemo(() => getRandomQuote(), []);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 flex items-end justify-center gap-1">
          <div
            className="w-1.5 bg-primary rounded-full animate-pulse-bar"
            style={{
              animationDelay: "0ms",
              animationDuration: "800ms",
            }}
          />
          <div
            className="w-1.5 bg-primary rounded-full animate-pulse-bar"
            style={{
              animationDelay: "150ms",
              animationDuration: "800ms",
            }}
          />
          <div
            className="w-1.5 bg-primary rounded-full animate-pulse-bar"
            style={{
              animationDelay: "300ms",
              animationDuration: "800ms",
            }}
          />
          <div
            className="w-1.5 bg-primary rounded-full animate-pulse-bar"
            style={{
              animationDelay: "450ms",
              animationDuration: "800ms",
            }}
          />
        </div>
      </div>
      {showQuote && quote && (
        <p className="text-sm text-muted-foreground italic max-w-md text-center">
          "{quote}"
        </p>
      )}
    </div>
  );
}

