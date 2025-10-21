export interface StockTicker {
  symbol: string;
  name: string;
  sector: 'tech' | 'finance' | 'healthcare' | 'energy' | 'consumer' | 'industrial';
}

// 15 popular stocks across different sectors
export const FEATURED_TICKERS: StockTicker[] = [
  { symbol: 'AMD', name: 'Advanced Micro Devices', sector: 'tech' },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'tech' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'tech' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'tech' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'consumer' },
  { symbol: 'NFLX', name: 'Netflix Inc.', sector: 'consumer' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'industrial' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'tech' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'finance' },
  { symbol: 'V', name: 'Visa Inc.', sector: 'finance' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'healthcare' },
  { symbol: 'WMT', name: 'Walmart Inc.', sector: 'consumer' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'consumer' },
  { symbol: 'MA', name: 'Mastercard Inc.', sector: 'finance' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'healthcare' },
];

