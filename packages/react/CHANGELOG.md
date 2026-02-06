# @gu-corp/eip721-subgraph-react

## 1.1.1

### Patch Changes

- 4b18e3e: Fix base64 (data URI) images disappearing after gateway timeout in TokenMedia

## 1.1.0

### Minor Changes

- d13ff40: Add TokenMedia component for rendering NFT media with gateway fallback
  - Add `TokenMedia` component that renders `<img>` or `<video>` from a tokenURI
  - Auto-detects video vs image based on metadata `animation_url` field
  - Supports `mediaType` prop to force image or video rendering
  - IPFS/Arweave gateway fallback with configurable timeout
  - Supports `fallbackSrc`, `loadingContent`, `errorContent` for loading/error states
  - Respects provider-level gateway configuration with per-component overrides

## 1.0.0

### Major Changes

- 4d45c6c: BREAKING: Use chain ID keys for SUBGRAPH_ENDPOINTS

  ## Breaking Changes

  `SUBGRAPH_ENDPOINTS` now uses chain IDs as keys instead of named strings:

  ```diff
  - SUBGRAPH_ENDPOINTS.joc
  + SUBGRAPH_ENDPOINTS[81]

  - SUBGRAPH_ENDPOINTS.joct
  + SUBGRAPH_ENDPOINTS[10081]
  ```

  ## Other Changes
  - Fix `useTokenMetadata` hook infinite re-render issue
  - Export `TokenData` type from react package

### Patch Changes

- Updated dependencies [4d45c6c]
  - @gu-corp/eip721-subgraph-client@1.0.0

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

### Patch Changes

- Updated dependencies [eeb26b7]
  - @gu-corp/eip721-subgraph-client@0.2.0

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
