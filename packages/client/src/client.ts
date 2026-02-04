import { Client, cacheExchange, fetchExchange } from '@urql/core';

export interface SubgraphClientConfig {
  url: string;
  fetch?: typeof fetch;
  headers?: Record<string, string>;
}

export interface SubgraphEndpoints {
  joc: string;
  jocTestnet: string;
  mainnet: string;
  sepolia: string;
}

/**
 * Default subgraph endpoints for different networks.
 * Update these URLs with your actual deployed subgraph endpoints.
 */
export const SUBGRAPH_ENDPOINTS: SubgraphEndpoints = {
  joc: 'https://api.studio.thegraph.com/query/<STUDIO_ID>/eip-721-joc/version/latest',
  jocTestnet:
    'https://api.studio.thegraph.com/query/<STUDIO_ID>/eip-721-joc-testnet/version/latest',
  mainnet:
    'https://api.studio.thegraph.com/query/<STUDIO_ID>/eip-721-mainnet/version/latest',
  sepolia:
    'https://api.studio.thegraph.com/query/<STUDIO_ID>/eip-721-sepolia/version/latest',
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
