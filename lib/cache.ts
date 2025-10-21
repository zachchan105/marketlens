import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'alphavantage');

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheMetadata {
  fromCache: boolean;
  fetchedAt: number;
  age: number; // milliseconds since fetch
  isStale: boolean;
}

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // Cache is optional, fail silently
  }
}

function getCachePath(key: string): string {
  const sanitized = key.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  return path.join(CACHE_DIR, `${sanitized}.json`);
}

function isValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

// Get cached data with freshness metadata
export async function getCacheWithMetadata<T>(key: string): Promise<{
  data: T;
  metadata: CacheMetadata;
} | null> {
  try {
    const cachePath = getCachePath(key);
    const content = await fs.readFile(cachePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(content);
    
    const age = Date.now() - entry.timestamp;
    const isStale = !isValid(entry);
    
    return {
      data: entry.data,
      metadata: {
        fromCache: true,
        fetchedAt: entry.timestamp,
        age,
        isStale,
      },
    };
  } catch (error) {
    return null;
  }
}

// Get cached data if still fresh, otherwise return null
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cachePath = getCachePath(key);
    const content = await fs.readFile(cachePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(content);
    
    if (isValid(entry)) {
      return entry.data;
    }
    
    // Keep expired cache as fallback, but return null to trigger fresh fetch
    return null;
  } catch (error) {
    // File doesn't exist or other error
    return null;
  }
}

// Save data to cache with TTL
export async function setCache<T>(
  key: string,
  data: T,
  ttl: number
): Promise<void> {
  try {
    await ensureCacheDir();
    const cachePath = getCachePath(key);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await fs.writeFile(cachePath, JSON.stringify(entry), 'utf-8');
  } catch (error) {
    // Silently fail - cache is optional
  }
}

// Get cache data even if expired (for fallback)
export async function getStaleCache<T>(key: string): Promise<{
  data: T;
  timestamp: number;
} | null> {
  try {
    const cachePath = getCachePath(key);
    const content = await fs.readFile(cachePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(content);
    return {
      data: entry.data,
      timestamp: entry.timestamp,
    };
  } catch (error) {
    return null;
  }
}

// Clear all cached data
export async function clearCache(): Promise<void> {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
  } catch (error) {
    // Silently fail
  }
}

