import { Client, cacheExchange, fetchExchange } from '@urql/core';

export interface SubgraphClientConfig {
  url: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export interface SubgraphEndpoints {
  [chainId: number]: string;
}

/**
 * Default subgraph endpoints for different networks.
 * - 81: JOC (Japan Open Chain)
 * - 10081: JOCT (Japan Open Chain Testnet)
 */
export const SUBGRAPH_ENDPOINTS: SubgraphEndpoints = {
  81: 'https://api.gu.net/v1/subgraphs/evm/81/eip721',
  10081: 'https://api.gu.net/v1/subgraphs/evm/10081/eip721',
};

/**
 * Creates a configured urql client for the EIP-721 subgraph.
 *
 * @example
 * ```typescript
 * import { createSubgraphClient, SUBGRAPH_ENDPOINTS } from '@gu-corp/eip721-subgraph-client';
 *
 * const client = createSubgraphClient({
 *   url: SUBGRAPH_ENDPOINTS.mainnet,
 * });
 * ```
 */
export function createSubgraphClient(config: SubgraphClientConfig): Client {
  return new Client({
    url: config.url,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => ({
      headers: config.headers,
    }),
    fetch: config.fetch,
  });
}
