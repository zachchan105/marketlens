export interface CompanyOverview {
  symbol: string;
  assetType: string;
  name: string;
  description: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: string;
  peRatio: string;
  dividendYield: string;
  high52Week: string;
  low52Week: string;
}

export interface DailyPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  changePercent?: number;
}

export function normalizeOverview(data: any): CompanyOverview | null {
  if (!data || !data.Symbol) {
    return null;
  }

  return {
    symbol: data.Symbol || 'N/A',
    assetType: data.AssetType || 'N/A',
    name: data.Name || 'N/A',
    description: data.Description || 'N/A',
    exchange: data.Exchange || 'N/A',
    sector: data.Sector || 'N/A',
    industry: data.Industry || 'N/A',
    marketCap: data.MarketCapitalization || 'N/A',
    peRatio: data.PERatio || 'N/A',
    dividendYield: data.DividendYield || 'N/A',
    high52Week: data['52WeekHigh'] || 'N/A',
    low52Week: data['52WeekLow'] || 'N/A',
  };
}

// Parse TIME_SERIES_DAILY response into usable format
export function normalizeDailyPrices(data: any): DailyPrice[] {
  if (!data || !data['Time Series (Daily)']) {
    return [];
  }

  const timeSeries = data['Time Series (Daily)'];
  const prices: DailyPrice[] = [];

  for (const [date, values] of Object.entries(timeSeries)) {
    const price: DailyPrice = {
      date,
      open: parseFloat((values as any)['1. open'] || '0'),
      high: parseFloat((values as any)['2. high'] || '0'),
      low: parseFloat((values as any)['3. low'] || '0'),
      close: parseFloat((values as any)['4. close'] || '0'),
      volume: parseInt((values as any)['5. volume'] || '0', 10),
    };
    prices.push(price);
  }

  // Sort by date descending (newest first)
  prices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate percent change from previous day
  for (let i = prices.length - 1; i >= 0; i--) {
    if (i < prices.length - 1) {
      const current = prices[i].close;
      const previous = prices[i + 1].close;
      if (previous !== 0) {
        prices[i].changePercent = ((current - previous) / previous) * 100;
      }
    }
  }

  return prices;
}

export function formatMarketCap(marketCap: string): string {
  const num = parseFloat(marketCap);
  if (isNaN(num)) return 'N/A';
  
  if (num >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  } else if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  }
  return `$${num.toFixed(2)}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

