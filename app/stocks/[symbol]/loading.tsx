import { MarketLensLoader } from "@/components/market-lens-loader";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" disabled className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Market
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <MarketLensLoader size="lg" />
        </div>
      </main>
    </div>
  );
}
