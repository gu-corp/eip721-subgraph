---
"@gu-corp/eip721-subgraph-client": major
"@gu-corp/eip721-subgraph-react": major
---

BREAKING: Use chain ID keys for SUBGRAPH_ENDPOINTS

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
