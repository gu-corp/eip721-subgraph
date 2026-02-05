/**
 * Standard NFT Metadata (ERC-721 Metadata JSON Schema)
 */
export interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  external_url?: string;
  animation_url?: string;
  attributes?: NFTAttribute[];
  [key: string]: unknown;
}

export interface NFTAttribute {
  trait_type?: string;
  value: string | number;
  display_type?: string;
}

/**
 * Cache interface for storing token metadata
 */
export interface MetadataCache {
  get(key: string): Promise<NFTMetadata | null> | NFTMetadata | null;
  set(key: string, value: NFTMetadata): Promise<void> | void;
  delete(key: string): Promise<void> | void;
  clear(): Promise<void> | void;
}

/**
 * Options for metadata fetching
 */
export interface FetchMetadataOptions {
  /** Cache implementation (default: in-memory) */
  cache?: MetadataCache | 'memory' | 'localStorage' | 'none';
  /** Cache TTL in milliseconds (default: 1 hour) */
  ttl?: number;
  /** IPFS gateway URLs - will try in order if one fails */
  ipfsGateways?: string[];
  /** Arweave gateway URLs - will try in order if one fails */
  arweaveGateways?: string[];
  /** Fetch timeout in milliseconds per gateway (default: 10000) */
  timeout?: number;
  /** Custom fetch function */
  fetch?: typeof fetch;
}

/**
 * Configuration for creating a metadata fetcher
 */
export interface MetadataFetcherConfig {
  /** Cache implementation */
  cache?: MetadataCache | 'memory' | 'localStorage' | 'none';
  /** Cache TTL in milliseconds (default: 1 hour) */
  ttl?: number;
  /** IPFS gateway URLs - will try in order if one fails */
  ipfsGateways?: string[];
  /** Arweave gateway URLs - will try in order if one fails */
  arweaveGateways?: string[];
  /** Fetch timeout in milliseconds per gateway */
  timeout?: number;
  /** Custom fetch function */
  fetch?: typeof fetch;
}
