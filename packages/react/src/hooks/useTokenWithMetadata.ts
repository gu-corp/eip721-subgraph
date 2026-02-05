import { useState, useEffect, useCallback } from 'react';
import {
  getTokenWithMetadata,
  getTokensWithMetadata,
  getTokensByOwnerWithMetadata,
  getTokensByContractWithMetadata,
  type TokenWithMetadata,
  type GetTokenWithMetadataOptions,
  type GetTokensVariables,
} from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../context';

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch a token from the subgraph along with its metadata from tokenURI.
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useTokenWithMetadata('0x..._1');
 *
 * if (loading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * return (
 *   <div>
 *     <h1>{data?.metadata?.name}</h1>
 *     <img src={data?.metadata?.image} />
 *   </div>
 * );
 * ```
 */
export function useTokenWithMetadata(
  id: string | null | undefined,
  options: GetTokenWithMetadataOptions = {}
): UseQueryResult<TokenWithMetadata> {
  const { client, metadataOptions } = useEIP721Context();
  const [data, setData] = useState<TokenWithMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Merge provider options with hook-specific options (hook options take precedence)
  const mergedOptions = { ...metadataOptions, ...options };

  const fetchData = useCallback(async () => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTokenWithMetadata(client, { id }, mergedOptions);
      if (result.error) {
        throw result.error;
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [id, client, mergedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch multiple tokens with their metadata.
 *
 * @example
 * ```tsx
 * const { data, loading } = useTokensWithMetadata({ first: 10, skip: 0 });
 * ```
 */
export function useTokensWithMetadata(
  variables: GetTokensVariables = { first: 10, skip: 0 },
  options: GetTokenWithMetadataOptions = {}
): UseQueryResult<TokenWithMetadata[]> {
  const { client, metadataOptions } = useEIP721Context();
  const [data, setData] = useState<TokenWithMetadata[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Merge provider options with hook-specific options (hook options take precedence)
  const mergedOptions = { ...metadataOptions, ...options };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getTokensWithMetadata(client, variables, mergedOptions);
      if (result.error) {
        throw result.error;
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [variables.first, variables.skip, variables.orderBy, variables.orderDirection, client, mergedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch tokens by owner with their metadata.
 *
 * @example
 * ```tsx
 * const { data, loading } = useTokensByOwnerWithMetadata('0x...');
 * ```
 */
export function useTokensByOwnerWithMetadata(
  owner: string | null | undefined,
  pagination: { first?: number; skip?: number } = {},
  options: GetTokenWithMetadataOptions = {}
): UseQueryResult<TokenWithMetadata[]> {
  const { client, metadataOptions } = useEIP721Context();
  const [data, setData] = useState<TokenWithMetadata[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { first = 10, skip = 0 } = pagination;

  // Merge provider options with hook-specific options (hook options take precedence)
  const mergedOptions = { ...metadataOptions, ...options };

  const fetchData = useCallback(async () => {
    if (!owner) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTokensByOwnerWithMetadata(
        client,
        { owner, first, skip },
        mergedOptions
      );
      if (result.error) {
        throw result.error;
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [owner, first, skip, client, mergedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch tokens by contract with their metadata.
 *
 * @example
 * ```tsx
 * const { data, loading } = useTokensByContractWithMetadata('0x...');
 * ```
 */
export function useTokensByContractWithMetadata(
  contract: string | null | undefined,
  pagination: { first?: number; skip?: number } = {},
  options: GetTokenWithMetadataOptions = {}
): UseQueryResult<TokenWithMetadata[]> {
  const { client, metadataOptions } = useEIP721Context();
  const [data, setData] = useState<TokenWithMetadata[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { first = 10, skip = 0 } = pagination;

  // Merge provider options with hook-specific options (hook options take precedence)
  const mergedOptions = { ...metadataOptions, ...options };

  const fetchData = useCallback(async () => {
    if (!contract) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getTokensByContractWithMetadata(
        client,
        { contract, first, skip },
        mergedOptions
      );
      if (result.error) {
        throw result.error;
      }
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [contract, first, skip, client, mergedOptions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
