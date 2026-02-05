import type {
  NFTMetadata,
  MetadataCache,
  FetchMetadataOptions,
  MetadataFetcherConfig,
} from './types';
import { createMemoryCache, createLocalStorageCache, createNoCache } from './cache';

const DEFAULT_IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://dweb.link/ipfs/',
  'https://w3s.link/ipfs/',
  'https://4everland.io/ipfs/',
  'https://ipfs.filebase.io/ipfs/',
  'https://flk-ipfs.xyz/ipfs/',
  'https://ipfs.runfission.com/ipfs/',
];

const DEFAULT_ARWEAVE_GATEWAYS = [
  'https://arweave.net/',
  'https://ar-io.net/',
];

const DEFAULT_TIMEOUT = 10000; // 10 seconds per gateway
const DEFAULT_TTL = 3600000; // 1 hour

/**
 * Resolves a token URI to fetchable HTTP URLs.
 * Returns an array of URLs to try in order (for failover).
 */
export function resolveTokenURI(
  uri: string,
  options: {
    ipfsGateways?: string[];
    arweaveGateways?: string[];
  } = {}
): string[] {
  const ipfsGateways = options.ipfsGateways?.length
    ? options.ipfsGateways
    : DEFAULT_IPFS_GATEWAYS;
  const arweaveGateways = options.arweaveGateways?.length
    ? options.arweaveGateways
    : DEFAULT_ARWEAVE_GATEWAYS;

  if (!uri) {
    throw new Error('Token URI is empty');
  }

  // IPFS protocol
  if (uri.startsWith('ipfs://')) {
    const hash = uri.slice(7);
    return ipfsGateways.map((gw) => gw + hash);
  }

  // IPFS path format
  if (uri.startsWith('/ipfs/')) {
    const hash = uri.slice(6);
    return ipfsGateways.map((gw) => gw + hash);
  }

  // Arweave protocol
  if (uri.startsWith('ar://')) {
    const hash = uri.slice(5);
    return arweaveGateways.map((gw) => gw + hash);
  }

  // Data URI - return as is
  if (uri.startsWith('data:')) {
    return [uri];
  }

  // HTTP/HTTPS - return as is
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return [uri];
  }

  // Assume it's an IPFS hash
  if (uri.match(/^[a-zA-Z0-9]{46,}/)) {
    return ipfsGateways.map((gw) => gw + uri);
  }

  return [uri];
}

/**
 * Parses a data URI and returns the JSON content.
 */
function parseDataURI(uri: string): NFTMetadata {
  const match = uri.match(/^data:application\/json;base64,(.+)$/);
  if (match) {
    const decoded = atob(match[1]);
    return JSON.parse(decoded);
  }

  const jsonMatch = uri.match(/^data:application\/json,(.+)$/);
  if (jsonMatch) {
    return JSON.parse(decodeURIComponent(jsonMatch[1]));
  }

  throw new Error('Invalid data URI format');
}

/**
 * Creates a cache key from a token URI.
 */
function getCacheKey(uri: string): string {
  return uri.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100);
}

/**
 * Resolves the cache implementation from options.
 */
function resolveCache(
  cache: MetadataCache | 'memory' | 'localStorage' | 'none' | undefined,
  ttl: number
): MetadataCache {
  if (!cache || cache === 'memory') {
    return createMemoryCache(ttl);
  }
  if (cache === 'localStorage') {
    return createLocalStorageCache('nft-metadata-', ttl);
  }
  if (cache === 'none') {
    return createNoCache();
  }
  return cache;
}

/**
 * Fetches from a single URL with timeout.
 */
async function fetchWithTimeout(
  url: string,
  timeout: number,
  fetchFn: typeof fetch
): Promise<NFTMetadata> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetchFn(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches token metadata from a token URI with caching and retry support.
 *
 * @example
 * ```typescript
 * import { fetchTokenMetadata } from '@gu-corp/eip721-subgraph-client';
 *
 * // Simple usage (uses default gateways with retry)
 * const metadata = await fetchTokenMetadata('ipfs://Qm...');
 *
 * // With custom gateways
 * const metadata = await fetchTokenMetadata('ipfs://Qm...', {
 *   ipfsGateways: [
 *     'https://my-gateway.com/ipfs/',
 *     'https://ipfs.io/ipfs/',
 *   ],
 *   cache: 'localStorage',
 * });
 * ```
 */
export async function fetchTokenMetadata(
  tokenURI: string,
  options: FetchMetadataOptions = {}
): Promise<NFTMetadata> {
  const ttl = options.ttl ?? DEFAULT_TTL;
  const cache = resolveCache(options.cache, ttl);
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;
  const fetchFn = options.fetch ?? fetch;

  // Check cache first
  const cacheKey = getCacheKey(tokenURI);
  const cached = await cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Handle data URIs directly
  if (tokenURI.startsWith('data:')) {
    const metadata = parseDataURI(tokenURI);
    await cache.set(cacheKey, metadata);
    return metadata;
  }

  // Resolve URI to HTTP URLs
  const urls = resolveTokenURI(tokenURI, {
    ipfsGateways: options.ipfsGateways,
    arweaveGateways: options.arweaveGateways,
  });

  // Try each URL in order
  const errors: Error[] = [];
  for (const url of urls) {
    try {
      const metadata = await fetchWithTimeout(url, timeout, fetchFn);
      // Cache the result
      await cache.set(cacheKey, metadata);
      return metadata;
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
      // Continue to next gateway
    }
  }

  // All gateways failed
  throw new Error(
    `Failed to fetch metadata from all gateways:\n${errors.map((e, i) => `  ${urls[i]}: ${e.message}`).join('\n')}`
  );
}

/**
 * Creates a reusable metadata fetcher with pre-configured options.
 *
 * @example
 * ```typescript
 * import { createMetadataFetcher } from '@gu-corp/eip721-subgraph-client';
 *
 * const fetcher = createMetadataFetcher({
 *   ipfsGateways: [
 *     'https://my-gateway.com/ipfs/',
 *     'https://ipfs.io/ipfs/',
 *   ],
 *   cache: 'localStorage',
 *   ttl: 3600000,
 * });
 *
 * const metadata = await fetcher.fetch('ipfs://Qm...');
 * ```
 */
export function createMetadataFetcher(config: MetadataFetcherConfig = {}) {
  const ttl = config.ttl ?? DEFAULT_TTL;
  const cache = resolveCache(config.cache, ttl);

  return {
    /**
     * Fetches token metadata from a token URI.
     */
    fetch(tokenURI: string): Promise<NFTMetadata> {
      return fetchTokenMetadata(tokenURI, {
        cache,
        ttl,
        ipfsGateways: config.ipfsGateways,
        arweaveGateways: config.arweaveGateways,
        timeout: config.timeout,
        fetch: config.fetch,
      });
    },

    /**
     * Resolves a token URI to fetchable HTTP URLs.
     * Returns an array of URLs (multiple gateways for IPFS/Arweave).
     */
    resolveURI(tokenURI: string): string[] {
      return resolveTokenURI(tokenURI, {
        ipfsGateways: config.ipfsGateways,
        arweaveGateways: config.arweaveGateways,
      });
    },

    /**
     * Clears the metadata cache.
     */
    clearCache(): void {
      cache.clear();
    },

    /**
     * Gets the underlying cache instance.
     */
    getCache(): MetadataCache {
      return cache;
    },
  };
}
