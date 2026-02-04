import { useState, useEffect, useCallback } from 'react';
import { GetGlobalStatisticsDocument } from '@gu-corp/eip721-subgraph-client';
import { useEIP721Context } from '../context';

interface GlobalStatisticsData {
  id: string;
  numTokenContracts: string;
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
 * Hook to fetch global statistics (total contracts, tokens, owners).
 */
export function useGlobalStatistics(): UseQueryResult<GlobalStatisticsData> {
  const { client } = useEIP721Context();
  const [data, setData] = useState<GlobalStatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.query(GetGlobalStatisticsDocument, {}).toPromise();
      if (result.error) {
        throw result.error;
      }
      setData(result.data?.all ?? null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
