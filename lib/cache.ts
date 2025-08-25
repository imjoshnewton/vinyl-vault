/**
 * Client-side caching utilities to reduce database compute usage
 */


const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes default cache

/**
 * LocalStorage cache with TTL support
 */
export class LocalCache {
  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
      // Clear old cache if storage is full
      this.clearExpired();
    }
  }

  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() - timestamp > ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  static clearExpired(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && parsed.ttl) {
            if (Date.now() - parsed.timestamp > parsed.ttl) {
              localStorage.removeItem(key);
            }
          }
        }
      } catch {
        // Invalid cache entry, skip
      }
    });
  }

  static clearAll(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('vinyl_vault_')) {
        localStorage.removeItem(key);
      }
    });
  }

  static getCacheSize(): number {
    let size = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('vinyl_vault_')) {
        const item = localStorage.getItem(key);
        if (item) {
          size += item.length;
        }
      }
    });
    return size;
  }
}

/**
 * Memory cache for session-based caching
 */
export class MemoryCache {
  private static cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

  static set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static remove(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }
}

/**
 * Cache keys for consistency
 */
export const CacheKeys = {
  USER_COLLECTION: (userId: string) => `vinyl_vault_collection_${userId}`,
  USER_PROFILE: (userId: string) => `vinyl_vault_profile_${userId}`,
  DISCOGS_SEARCH: (query: string) => `vinyl_vault_discogs_${query}`,
  NOW_SPINNING: (userId: string) => `vinyl_vault_now_spinning_${userId}`,
  COLLECTION_STATS: (userId: string) => `vinyl_vault_stats_${userId}`,
} as const;

/**
 * Stale-while-revalidate implementation
 */
export async function staleWhileRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    staleTime?: number;
    onSuccess?: (data: T) => void;
  } = {}
): Promise<T> {
  const { ttl = DEFAULT_TTL, staleTime = 30000, onSuccess } = options; // 30s stale time

  // Try to get from memory cache first (fastest)
  const memCached = MemoryCache.get<T>(key);
  if (memCached) {
    return memCached;
  }

  // Try to get from localStorage (persistent)
  const localCached = LocalCache.get<T>(key);
  if (localCached) {
    // Put in memory cache for faster subsequent access
    MemoryCache.set(key, localCached, ttl);
    
    // Check if data is stale and revalidate in background
    const cacheAge = Date.now() - (JSON.parse(localStorage.getItem(key) || '{}').timestamp || 0);
    if (cacheAge > staleTime) {
      // Revalidate in background
      fetcher().then(freshData => {
        LocalCache.set(key, freshData, ttl);
        MemoryCache.set(key, freshData, ttl);
        onSuccess?.(freshData);
      }).catch(console.error);
    }
    
    return localCached;
  }

  // No cache, fetch fresh data
  const freshData = await fetcher();
  
  // Cache the fresh data
  LocalCache.set(key, freshData, ttl);
  MemoryCache.set(key, freshData, ttl);
  onSuccess?.(freshData);
  
  return freshData;
}

/**
 * Optimistic update helper
 */
export function optimisticUpdate<T>(
  key: string,
  updater: (current: T) => T
): void {
  // Update memory cache
  const memCached = MemoryCache.get<T>(key);
  if (memCached) {
    const updated = updater(memCached);
    MemoryCache.set(key, updated);
  }

  // Update localStorage
  const localCached = LocalCache.get<T>(key);
  if (localCached) {
    const updated = updater(localCached);
    LocalCache.set(key, updated);
  }
}

/**
 * Batch cache invalidation
 */
export function invalidateCache(patterns: string[]): void {
  patterns.forEach(pattern => {
    // Clear from memory cache
    MemoryCache.remove(pattern);
    
    // Clear from localStorage
    LocalCache.remove(pattern);
    
    // Also clear any keys that start with the pattern
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(pattern)) {
        localStorage.removeItem(key);
      }
    });
  });
}