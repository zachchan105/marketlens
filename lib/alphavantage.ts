import { getCache, setCache, getStaleCache, getCacheWithMetadata, CacheMetadata } from './cache';

const API_KEY = process.env.ALPHAVANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';

// Cache TTLs (conservative to preserve API calls)
const OVERVIEW_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const PRICES_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiter (5 requests/minute limit)
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 12000; // 12 seconds between requests
async function rateLimit(): Promise<void> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
}

async function makeRequest(params: Record<string, string>): Promise<any> {
  await rateLimit();
  
  const url = new URL(BASE_URL);
  url.searchParams.append('apikey', API_KEY);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.append(key, value);
  }
  
  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`AlphaVantage API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  if (data['Error Message']) {
    throw new Error(`API error: ${data['Error Message']}`);
  }
  
  if (data['Note']) {
    throw new Error('Rate limit exceeded');
  }
  
  return data;
}

export async function fetchOverview(symbol: string): Promise<{
  data: any;
  metadata?: CacheMetadata;
}> {
  const cacheKey = `overview_${symbol}`;
  
  // Try fresh cache first
  const cached = await getCacheWithMetadata<any>(cacheKey);
  if (cached && !cached.metadata.isStale) {
    return { data: cached.data, metadata: cached.metadata };
  }
  
  // Try fetching from API
  try {
    const data = await makeRequest({
      function: 'OVERVIEW',
      symbol,
    });
    
    // Don't cache errors or rate limit messages
    if (data['Error Message'] || data['Note'] || data['Information']) {
      console.warn(`API returned error for ${symbol}:`, data['Error Message'] || data['Note'] || data['Information']);
      
      // Try to return stale cache as fallback
      const staleCache = await getCacheWithMetadata<any>(cacheKey);
      if (staleCache) {
        return {
          data: staleCache.data,
          metadata: { ...staleCache.metadata, isStale: true },
        };
      }
      
      throw new Error(data['Information'] || data['Note'] || data['Error Message'] || 'API error');
    }
    
    // Only cache valid data that has Symbol
    if (data['Symbol']) {
      // Stagger expiration: Add 0-2 days offset based on symbol hash
      // This prevents all 15 stocks from expiring on the same day
      const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const staggerOffset = (hash % 3) * 24 * 60 * 60 * 1000; // 0, 1, or 2 days
      const staggeredTTL = OVERVIEW_TTL + staggerOffset;
      
      await setCache(cacheKey, data, staggeredTTL);
    }
    
    return {
      data,
      metadata: {
        fromCache: false,
        fetchedAt: Date.now(),
        age: 0,
        isStale: false,
      },
    };
  } catch (error) {
    // Try to return stale cache as fallback (last known good)
    const staleCache = await getCacheWithMetadata<any>(cacheKey);
    if (staleCache) {
      return {
        data: staleCache.data,
        metadata: { ...staleCache.metadata, isStale: true },
      };
    }
    
    throw error;
  }
}

export async function fetchDailyPrices(symbol: string): Promise<{
  data: any;
  metadata?: CacheMetadata;
}> {
  const cacheKey = `prices_${symbol}`;
  
  // Try fresh cache first
  const cached = await getCacheWithMetadata<any>(cacheKey);
  if (cached && !cached.metadata.isStale) {
    return { data: cached.data, metadata: cached.metadata };
  }
  
  // Try fetching from API
  try {
    const data = await makeRequest({
      function: 'TIME_SERIES_DAILY', // Free tier endpoint (not ADJUSTED)
      symbol,
      outputsize: 'compact', // Last 100 data points
    });
    
    // Don't cache errors or rate limit messages
    if (data['Error Message'] || data['Note'] || data['Information']) {
      console.warn(`API returned error for ${symbol}:`, data['Error Message'] || data['Note'] || data['Information']);
      
      // Try to return stale cache as fallback
      const staleCache = await getCacheWithMetadata<any>(cacheKey);
      if (staleCache) {
        return {
          data: staleCache.data,
          metadata: { ...staleCache.metadata, isStale: true },
        };
      }
      
      throw new Error(data['Information'] || data['Note'] || data['Error Message'] || 'API error');
    }
    
    // Only cache valid data that has Time Series
    if (data['Time Series (Daily)']) {
      await setCache(cacheKey, data, PRICES_TTL);
    }
    
    return {
      data,
      metadata: {
        fromCache: false,
        fetchedAt: Date.now(),
        age: 0,
        isStale: false,
      },
    };
  } catch (error) {
    // Try to return stale cache as fallback (last known good)
    const staleCache = await getCacheWithMetadata<any>(cacheKey);
    if (staleCache) {
      return {
        data: staleCache.data,
        metadata: { ...staleCache.metadata, isStale: true },
      };
    }
    
    throw error;
  }
}

