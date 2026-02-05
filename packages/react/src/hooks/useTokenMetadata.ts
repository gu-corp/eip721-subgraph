import { useState, useEffect, useCallback } from 'react';
import {
  fetchTokenMetadata,
  type NFTMetadata,
  type FetchMetadataOptions,
} from '@gu-corp/eip721-subgraph-client';

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
 * // Basic usage
 * const { data, loading, error } = useTokenMetadata('ipfs://Qm.../metadata.json');
 *
 * // With options
 * const { data, loading } = useTokenMetadata(tokenURI, {
 *   ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
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
  const [data, setData] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      const metadata = await fetchTokenMetadata(tokenURI, options);
      setData(metadata);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [tokenURI]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
