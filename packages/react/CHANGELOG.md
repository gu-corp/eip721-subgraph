# @gu-corp/eip721-subgraph-react

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

### Patch Changes

- Updated dependencies [fd13849]
  - @gu-corp/eip721-subgraph-client@0.1.0
