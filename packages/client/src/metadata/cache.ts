import type { MetadataCache, NFTMetadata } from './types';

interface CacheEntry {
  value: NFTMetadata;
  expiresAt: number;
}

/**
 * Creates an in-memory cache for token metadata.
 * Works in both Node.js and browser environments.
 */
export function createMemoryCache(ttl: number = 3600000): MetadataCache {
  const cache = new Map<string, CacheEntry>();

  return {
    get(key: string): NFTMetadata | null {
      const entry = cache.get(key);
      if (!entry) return null;

      if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
      }

      return entry.value;
    },

    set(key: string, value: NFTMetadata): void {
      cache.set(key, {
        value,
        expiresAt: Date.now() + ttl,
      });
    },

    delete(key: string): void {
      cache.delete(key);
    },

    clear(): void {
      cache.clear();
    },
  };
}

/**
 * Creates a localStorage-based cache for token metadata.
 * Only works in browser environments. Falls back to memory cache in Node.js.
 */
export function createLocalStorageCache(
  prefix: string = 'nft-metadata-',
  ttl: number = 3600000
): MetadataCache {
  // Fall back to memory cache if localStorage is not available
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage not available, falling back to memory cache');
    return createMemoryCache(ttl);
  }

  return {
    get(key: string): NFTMetadata | null {
      try {
        const item = localStorage.getItem(prefix + key);
        if (!item) return null;

        const entry: CacheEntry = JSON.parse(item);
        if (Date.now() > entry.expiresAt) {
          localStorage.removeItem(prefix + key);
          return null;
        }

        return entry.value;
      } catch {
        return null;
      }
    },

    set(key: string, value: NFTMetadata): void {
      try {
        const entry: CacheEntry = {
          value,
          expiresAt: Date.now() + ttl,
        };
        localStorage.setItem(prefix + key, JSON.stringify(entry));
      } catch {
        // localStorage might be full or disabled
      }
    },

    delete(key: string): void {
      try {
        localStorage.removeItem(prefix + key);
      } catch {
        // Ignore errors
      }
    },

    clear(): void {
      try {
        const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
        keys.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore errors
      }
    },
  };
}

/**
 * A no-op cache that doesn't store anything.
 */
export function createNoCache(): MetadataCache {
  return {
    get: () => null,
    set: () => {},
    delete: () => {},
    clear: () => {},
  };
}
