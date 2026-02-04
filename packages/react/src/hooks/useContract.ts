import { useState, useEffect, useCallback } from 'react';
import {
  GetTokenContractDocument,
  GetTokenContractsDocument,
  type GetTokenContractVariables,
  type GetTokenContractsVariables,
} from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../context';

interface TokenContractData {
  id: string;
  name: string | null;
  symbol: string | null;
  doAllAddressesOwnTheirIdByDefault: boolean;
  supportsEIP721Metadata: boolean;
  numTokens: string;
  numOwners: string;
}

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook to fetch a single token contract by address.
 */
export function useTokenContract(
  id: string | null | undefined
): UseQueryResult<TokenContractData> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<TokenContractData | null>(null);
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
      const result = await client
        .query(GetTokenContractDocument, { id } as GetTokenContractVariables)
        .toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.tokenContract ?? null);
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
 * Hook to fetch multiple token contracts with pagination.
 */
export function useTokenContracts(
  variables: GetTokenContractsVariables = { first: 10, skip: 0 }
): UseQueryResult<TokenContractData[]> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<TokenContractData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query(GetTokenContractsDocument, variables).toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.tokenContracts ?? null);
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
