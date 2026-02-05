import { useState, useEffect, useCallback } from 'react';
import {
  fetchTokenMetadata,
  type NFTMetadata,
  type FetchMetadataOptions,
} from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../context';

interface UseTokenMetadataResult {
  data: NFTMetadata | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch NFT metadata directly from a tokenURI.
 *
 * This hook is useful when you already have the tokenURI and want to fetch
 * metadata without querying the subgraph. It's also useful for progressive
 * loading patterns where you first fetch tokens without metadata, then
 * load metadata individually.
 *
 * @example
 * ```tsx
 * // Basic usage (uses provider's global gateway config)
 * const { data, loading, error } = useTokenMetadata('ipfs://Qm.../metadata.json');
 *
 * // With options (overrides provider config)
 * const { data, loading } = useTokenMetadata(tokenURI, {
 *   ipfsGateways: ['https://my-gateway.com/ipfs/'],
 *   timeout: 10000,
 * });
 *
 * // Progressive loading pattern
 * const { data: tokens } = useTokensByOwner(ownerAddress);
 * // Then for each token, load metadata individually:
 * const { data: metadata } = useTokenMetadata(token?.tokenURI);
 * ```
 */
export function useTokenMetadata(
  tokenURI: string | null | undefined,
  options: FetchMetadataOptions = {}
): UseTokenMetadataResult {
  const { metadataOptions } = useEIP721Context();
  const [data, setData] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Merge provider options with hook-specific options (hook options take precedence)
  const mergedOptions = { ...metadataOptions, ...options };

  const fetchData = useCallback(async () => {
    if (!tokenURI) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const metadata = await fetchTokenMetadata(tokenURI, mergedOptions);
      setData(metadata);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [tokenURI, mergedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
