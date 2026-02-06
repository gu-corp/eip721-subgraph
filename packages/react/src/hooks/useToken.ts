import { useState, useEffect, useCallback } from 'react';
import {
  GetTokenDocument,
  GetTokensDocument,
  GetTokensByOwnerDocument,
  GetTokensByContractDocument,
  type GetTokenVariables,
  type GetTokensVariables,
  type GetTokensByOwnerVariables,
  type GetTokensByContractVariables,
} from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../context';

export interface TokenData {
  id: string;
  tokenID: string;
  mintTime: string;
  tokenURI: string | null;
  owner: { id: string; numTokens?: string };
  contract: { id: string; name: string | null; symbol: string | null };
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch a single token by ID.
 */
export function useToken(id: string | null | undefined): UseQueryResult<TokenData> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
      const result = await client.query(GetTokenDocument, { id } as GetTokenVariables).toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.token ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [id, client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch multiple tokens with pagination.
 */
export function useTokens(
  variables: GetTokensVariables = { first: 10, skip: 0 }
): UseQueryResult<TokenData[]> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<TokenData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query(GetTokensDocument, variables).toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.tokens ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [variables.first, variables.skip, variables.orderBy, variables.orderDirection, client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch tokens by owner address.
 */
export function useTokensByOwner(
  owner: string | null | undefined,
  pagination: { first?: number; skip?: number } = {}
): UseQueryResult<TokenData[]> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<TokenData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { first = 10, skip = 0 } = pagination;

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
      const result = await client
        .query(GetTokensByOwnerDocument, { owner, first, skip } as GetTokensByOwnerVariables)
        .toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.tokens ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [owner, first, skip, client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to fetch tokens by contract address.
 */
export function useTokensByContract(
  contract: string | null | undefined,
  pagination: { first?: number; skip?: number } = {}
): UseQueryResult<TokenData[]> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<TokenData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { first = 10, skip = 0 } = pagination;

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
      const result = await client
        .query(GetTokensByContractDocument, {
          contract,
          first,
          skip,
        } as GetTokensByContractVariables)
        .toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.tokens ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [contract, first, skip, client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
