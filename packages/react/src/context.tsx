import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createSubgraphClient, type FetchMetadataOptions } from '@gu-corp/eip721-subgraph-client';

/**
 * Metadata fetching configuration for the provider.
 */
export interface MetadataConfig {
  /** Custom IPFS gateways (overrides defaults) */
  ipfsGateways?: string[];
  /** Custom Arweave gateways (overrides defaults) */
  arweaveGateways?: string[];
  /** Timeout in milliseconds for metadata fetching */
  timeout?: number;
  /** Cache strategy: 'memory' (default), 'localStorage', or 'none' */
  cache?: 'memory' | 'localStorage' | 'none';
  /** Cache TTL in milliseconds (default: 1 hour) */
  ttl?: number;
}

export interface EIP721ProviderConfig {
  /** Subgraph endpoint URL */
  url: string;
  /** Global metadata fetching configuration */
  metadata?: MetadataConfig;
}

interface EIP721ContextValue {
  client: ReturnType<typeof createSubgraphClient>;
  metadataOptions: FetchMetadataOptions;
}

const EIP721Context = createContext<EIP721ContextValue | null>(null);

export interface EIP721ProviderProps {
  config: EIP721ProviderConfig;
  children: ReactNode;
}

export function EIP721Provider({ config, children }: EIP721ProviderProps) {
  const value = useMemo(() => {
    const client = createSubgraphClient({ url: config.url });
    const metadataOptions: FetchMetadataOptions = {
      ipfsGateways: config.metadata?.ipfsGateways,
      arweaveGateways: config.metadata?.arweaveGateways,
      timeout: config.metadata?.timeout,
      cache: config.metadata?.cache,
      ttl: config.metadata?.ttl,
    };
    return { client, metadataOptions };
  }, [
    config.url,
    config.metadata?.ipfsGateways,
    config.metadata?.arweaveGateways,
    config.metadata?.timeout,
    config.metadata?.cache,
    config.metadata?.ttl,
  ]);

  return <EIP721Context.Provider value={value}>{children}</EIP721Context.Provider>;
}

export function useEIP721Context(): EIP721ContextValue {
  const context = useContext(EIP721Context);
  if (!context) {
    throw new Error('useEIP721Context must be used within an EIP721Provider');
  }
  return context;
}
