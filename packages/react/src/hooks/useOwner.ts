import { useState, useEffect, useCallback } from 'react';
import {
  GetOwnerDocument,
  GetOwnersDocument,
  GetOwnerPerTokenContractsDocument,
  type GetOwnerVariables,
  type GetOwnersVariables,
  type GetOwnerPerTokenContractsVariables,
} from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../context';

interface OwnerData {
  id: string;
  numTokens: string;
}

interface OwnerPerTokenContractData {
  id: string;
  numTokens: string;
  contract: {
    id: string;
    name: string | null;
    symbol: string | null;
    numTokens: string;
  };
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch a single owner by address.
 */
export function useOwner(id: string | null | undefined): UseQueryResult<OwnerData> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<OwnerData | null>(null);
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
      const result = await client.query(GetOwnerDocument, { id } as GetOwnerVariables).toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.owner ?? null);
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
 * Hook to fetch multiple owners with pagination.
 */
export function useOwners(
  variables: GetOwnersVariables = { first: 10, skip: 0 }
): UseQueryResult<OwnerData[]> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<OwnerData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query(GetOwnersDocument, variables).toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.owners ?? null);
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
 * Hook to fetch token contracts owned by an address.
 */
export function useOwnerPerTokenContracts(
  owner: string | null | undefined,
  pagination: { first?: number; skip?: number } = {}
): UseQueryResult<OwnerPerTokenContractData[]> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<OwnerPerTokenContractData[] | null>(null);
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
        .query(GetOwnerPerTokenContractsDocument, {
          owner,
          first,
          skip,
        } as GetOwnerPerTokenContractsVariables)
        .toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.ownerPerTokenContracts ?? null);
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
