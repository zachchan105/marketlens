import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'alphavantage');

// Read cache file with timestamp
export async function readCacheFile(key: string): Promise<{ data: any; timestamp: number } | null> {
  try {
    const sanitized = key.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    const cachePath = path.join(CACHE_DIR, `${sanitized}.json`);
    const content = await fs.readFile(cachePath, 'utf-8');
    const entry = JSON.parse(content);
    return { data: entry.data, timestamp: entry.timestamp };
  } catch {
    return null;
  }
}

// Get all cached data for homepage (overview + latest price)
export async function getCachedStockData(symbols: string[]) {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      const overview = await readCacheFile(`overview_${symbol}`);
      const prices = await readCacheFile(`prices_${symbol}`);
      
      if (!overview || !overview.data.Symbol) {
        return { symbol, data: null };
      }

      let priceData = null;
      if (prices && prices.data['Time Series (Daily)']) {
        const timeSeries = prices.data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).sort().reverse();
        const latest = timeSeries[dates[0]];
        
        if (latest) {
          priceData = {
            price: parseFloat(latest['4. close']),
            timestamp: prices.timestamp, // Use actual cache fetch time!
          };
        }
      }

      return {
        symbol,
        data: {
          marketCap: overview.data.MarketCapitalization,
          peRatio: overview.data.PERatio,
          dividendYield: overview.data.DividendYield,
          sector: overview.data.Sector,
          industry: overview.data.Industry,
          exchange: overview.data.Exchange,
          priceData,
        },
      };
    })
  );

  return Object.fromEntries(
    results.map(r => [r.symbol, r.data])
  );
}

