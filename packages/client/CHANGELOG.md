# @gu-corp/eip721-subgraph-client

## 0.2.0

### Minor Changes

- eeb26b7: Add metadata fetching support

  ## Client Package
  - Add `fetchTokenMetadata` function with IPFS/Arweave gateway fallback
  - Add `resolveTokenURI` for data URI and protocol handling
  - Add `createMetadataFetcher` for advanced usage with custom config
  - Add caching support (memory, localStorage, custom cache)
  - Add `getTokenWithMetadata`, `getTokensWithMetadata` functions
  - Add `getTokensByOwnerWithMetadata`, `getTokensByContractWithMetadata` functions
  - Include 9 default IPFS gateways for reliability

  ## React Package
  - Add `useTokenMetadata` hook for fetching metadata from tokenURI directly
  - Add `useTokenWithMetadata` hook for single token with metadata
  - Add `useTokensWithMetadata` hook for multiple tokens with metadata
  - Add `useTokensByOwnerWithMetadata` hook
  - Add `useTokensByContractWithMetadata` hook
  - Add global metadata configuration at provider level (ipfsGateways, arweaveGateways, timeout, cache, ttl)
  - Hook-specific options override provider options

## 0.1.0

### Minor Changes

- fd13849: ### @gu-corp/eip721-subgraph-client

  New TypeScript client package for querying EIP721 subgraph:
  - Add `createSubgraphClient()` factory with urql
  - Add `SUBGRAPH_ENDPOINTS` with JOC and JOCT endpoints
  - Add query functions: `getToken`, `getTokens`, `getTokensByOwner`, `getTokensByContract`
  - Add query functions: `getOwner`, `getOwners`, `getOwnerPerTokenContract`, `getOwnerPerTokenContracts`
  - Add query functions: `getTokenContract`, `getTokenContracts`
  - Add `getGlobalStatistics` function
  - Auto-generated TypeScript types from subgraph schema

  ### @gu-corp/eip721-subgraph-react

  New React hooks package for querying EIP721 subgraph:
  - Add `EIP721Provider` context for configuration
  - Add token hooks: `useToken`, `useTokens`, `useTokensByOwner`, `useTokensByContract`
  - Add owner hooks: `useOwner`, `useOwners`, `useOwnerPerTokenContracts`
  - Add contract hooks: `useTokenContract`, `useTokenContracts`
  - Add `useGlobalStatistics` hook
  - Re-export `SUBGRAPH_ENDPOINTS` for convenience
