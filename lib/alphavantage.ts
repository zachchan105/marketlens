import { getCache, setCache, getStaleCache, getCacheWithMetadata, CacheMetadata } from './cache';

const API_KEY = process.env.ALPHAVANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';

const OVERVIEW_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const PRICES_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Rate limiting: 12s between requests to stay under 5/min API limit
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 12000;
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
  
  const cached = await getCacheWithMetadata<any>(cacheKey);
  if (cached && !cached.metadata.isStale) {
    return { data: cached.data, metadata: cached.metadata };
  }
  
  try {
    const data = await makeRequest({
      function: 'OVERVIEW',
      symbol,
    });
    
    if (data['Error Message'] || data['Note'] || data['Information']) {
      console.warn(`API returned error for ${symbol}:`, data['Error Message'] || data['Note'] || data['Information']);
      
      const staleCache = await getCacheWithMetadata<any>(cacheKey);
      if (staleCache) {
        return {
          data: staleCache.data,
          metadata: { ...staleCache.metadata, isStale: true },
        };
      }
      
      throw new Error(data['Information'] || data['Note'] || data['Error Message'] || 'API error');
    }
    
    if (data['Symbol']) {
      // Stagger expiration by 0-2 days to avoid simultaneous cache invalidation
      const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const staggerOffset = (hash % 3) * 24 * 60 * 60 * 1000;
      const staggeredTTL = OVERVIEW_TTL + staggerOffset;
      
      await setCache(cacheKey, data, staggeredTTL);
      console.log(`✓ Cached overview for ${symbol} (TTL: ${Math.round(staggeredTTL / 86400000)}d)`);
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
  
  const cached = await getCacheWithMetadata<any>(cacheKey);
  if (cached && !cached.metadata.isStale) {
    return { data: cached.data, metadata: cached.metadata };
  }
  
  try {
    const data = await makeRequest({
      function: 'TIME_SERIES_DAILY',
      symbol,
      outputsize: 'compact',
    });
    
    if (data['Error Message'] || data['Note'] || data['Information']) {
      console.warn(`API returned error for ${symbol}:`, data['Error Message'] || data['Note'] || data['Information']);
      
      const staleCache = await getCacheWithMetadata<any>(cacheKey);
      if (staleCache) {
        return {
          data: staleCache.data,
          metadata: { ...staleCache.metadata, isStale: true },
        };
      }
      
      throw new Error(data['Information'] || data['Note'] || data['Error Message'] || 'API error');
    }
    
    if (data['Time Series (Daily)']) {
      await setCache(cacheKey, data, PRICES_TTL);
      console.log(`✓ Cached prices for ${symbol} (TTL: 24h)`);
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

