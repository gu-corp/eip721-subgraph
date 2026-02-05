---
"@gu-corp/eip721-subgraph-client": minor
"@gu-corp/eip721-subgraph-react": minor
---

Add metadata fetching support

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
