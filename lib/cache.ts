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
  age: number;
  isStale: boolean;
}

async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch {
    // Cache failures are non-fatal
  }
}

function getCachePath(key: string): string {
  const sanitized = key.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
  return path.join(CACHE_DIR, `${sanitized}.json`);
}

function isValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

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

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cachePath = getCachePath(key);
    const content = await fs.readFile(cachePath, 'utf-8');
    const entry: CacheEntry<T> = JSON.parse(content);
    
    if (isValid(entry)) {
      return entry.data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

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
    // Cache failures are non-fatal
  }
}

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

export async function clearCache(): Promise<void> {
  try {
    await fs.rm(CACHE_DIR, { recursive: true, force: true });
  } catch (error) {
    // Non-fatal
  }
}

