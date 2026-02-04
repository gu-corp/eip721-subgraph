# Architecture

## Monorepo Overview

This project is a **pnpm + Turborepo monorepo** containing three packages:

```
eip721-subgraph/
├── packages/
│   ├── subgraph/     # @gu-corp/eip721-subgraph - The Graph indexer
│   ├── client/       # @gu-corp/eip721-subgraph-client - TypeScript client
│   └── react/        # @gu-corp/eip721-subgraph-react - React hooks
├── turbo.json        # Build pipeline
└── pnpm-workspace.yaml
```

## System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Blockchain    │────▶│   Graph Node     │────▶│   GraphQL API   │
│  (ERC-721 TXs)  │     │  (Indexing)      │     │   (Queries)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │                        ▲
                               ▼                        │
                        ┌──────────────────┐     ┌──────────────────┐
                        │   PostgreSQL     │     │  Client Package  │
                        │   (Entity Store) │     │  (urql + types)  │
                        └──────────────────┘     └──────────────────┘
                                                        ▲
                                                        │
                                                 ┌──────────────────┐
                                                 │  React Package   │
                                                 │  (hooks)         │
                                                 └──────────────────┘
```

## Package: Subgraph

### Data Flow

```
Transfer Event
      │
      ▼
┌─────────────────────────────────────┐
│  1. Load/Create TokenContract       │
│     - Check EIP-165 compliance      │
│     - Verify EIP-721 interface      │
│     - Fetch name/symbol metadata    │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  2. Process Sender (from address)   │
│     - Skip if minting (from=0x0)    │
│     - Decrement owner token counts  │
│     - Update OwnerPerTokenContract  │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  3. Process Receiver (to address)   │
│     - Skip if burning (to=0x0)      │
│     - Create/update Token entity    │
│     - Increment owner token counts  │
│     - Update OwnerPerTokenContract  │
└─────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────┐
│  4. Update Global Statistics        │
│     - All.numTokens                 │
│     - All.numOwners                 │
│     - All.numTokenContracts         │
└─────────────────────────────────────┘
```

### Entity Relationships

```
┌─────────────┐
│     All     │  (Singleton: id="all")
│─────────────│
│ numTokens   │
│ numOwners   │
│ numContracts│
└─────────────┘

┌───────────────────┐         ┌─────────────────┐
│   TokenContract   │◀────────│      Token      │
│───────────────────│ 1     N │─────────────────│
│ id (address)      │         │ id (addr_tokenId)│
│ name              │         │ tokenID         │
│ symbol            │         │ mintTime        │
│ numTokens         │         │ owner ──────────┼──┐
│ numOwners         │         └─────────────────┘  │
│ supportsMetadata  │                              │
└───────────────────┘                              │
        │                                          │
        │                     ┌─────────────────┐  │
        │              N      │      Owner      │◀─┘
        │         ┌──────────▶│─────────────────│
        │         │           │ id (address)    │
        │         │           │ numTokens       │
        ▼         │           └─────────────────┘
┌───────────────────────────┐         │
│  OwnerPerTokenContract    │         │
│───────────────────────────│◀────────┘
│ id (contract_owner)       │
│ numTokens                 │
└───────────────────────────┘
```

### EIP-721 Compliance Validation

Before indexing a contract, the subgraph validates EIP-721 compliance:

```
supportsInterface(0x01ffc9a7) == true   // EIP-165
    AND
supportsInterface(0x80ac58cd) == true   // EIP-721
    AND
supportsInterface(0x00000000) == false  // Null check
```

Optional metadata support is detected via:
```
supportsInterface(0x5b5e139f) == true   // EIP-721 Metadata
```

### ID Schemes

| Entity | ID Format | Example |
|--------|-----------|---------|
| All | `"all"` | `"all"` |
| Token | `{contract}_{tokenId}` | `"0xabc...123_42"` |
| TokenContract | `{contract}` | `"0xabc...123"` |
| Owner | `{address}` | `"0xdef...456"` |
| OwnerPerTokenContract | `{contract}_{owner}` | `"0xabc...123_0xdef...456"` |

## Package: Client

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client Package                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Types     │  │   Queries   │  │   Client    │ │
│  │  (codegen)  │  │ (tokens,    │  │ (urql +     │ │
│  │             │  │  owners,    │  │  presets)   │ │
│  │             │  │  contracts) │  │             │ │
│  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Type Generation Flow

```
packages/subgraph/schema.graphql
            │
            ▼
    graphql-codegen
            │
            ▼
packages/client/src/types/index.ts
```

### Query Functions

| Function | Description |
|----------|-------------|
| `getToken(id)` | Get single token by ID |
| `getTokens(pagination)` | Get paginated tokens |
| `getTokensByOwner(owner)` | Get tokens owned by address |
| `getTokensByContract(contract)` | Get tokens from contract |
| `getOwner(id)` | Get owner by address |
| `getOwners(pagination)` | Get paginated owners |
| `getTokenContract(id)` | Get contract metadata |
| `getTokenContracts(pagination)` | Get paginated contracts |
| `getGlobalStatistics()` | Get global stats |

## Package: React

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Package                      │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────────────────────┐  │
│  │   Context   │  │          Hooks              │  │
│  │─────────────│  │─────────────────────────────│  │
│  │ EIP721      │  │ useToken, useTokens         │  │
│  │ Provider    │  │ useTokensByOwner            │  │
│  │             │  │ useTokensByContract         │  │
│  │             │  │ useOwner, useOwners         │  │
│  │             │  │ useOwnerPerTokenContracts   │  │
│  │             │  │ useTokenContract            │  │
│  │             │  │ useTokenContracts           │  │
│  │             │  │ useGlobalStatistics         │  │
│  └─────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### React Hooks

| Hook | Description |
|------|-------------|
| `useToken(id)` | Fetch single token |
| `useTokens(options)` | Fetch tokens with pagination |
| `useTokensByOwner(owner)` | Fetch tokens by owner |
| `useTokensByContract(contract)` | Fetch tokens by contract |
| `useOwner(id)` | Fetch single owner |
| `useOwners(options)` | Fetch owners with pagination |
| `useOwnerPerTokenContracts(owner)` | Fetch contracts owned by address |
| `useTokenContract(id)` | Fetch single contract |
| `useTokenContracts(options)` | Fetch contracts with pagination |
| `useGlobalStatistics()` | Fetch total contracts, tokens, owners |

### Usage Example

```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokens
} from '@gu-corp/eip721-subgraph-react';

function App() {
  return (
    <EIP721Provider config={{ url: SUBGRAPH_ENDPOINTS.joc }}>
      <TokenList />
    </EIP721Provider>
  );
}

function TokenList() {
  const { data, loading, error } = useTokens({ first: 10, skip: 0 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.map(token => (
        <li key={token.id}>{token.tokenID}</li>
      ))}
    </ul>
  );
}
```

## Supported Networks

Configured in `packages/subgraph/networks.json`:

| Network | Start Block | Endpoint |
|---------|-------------|----------|
| joc | 1 | `SUBGRAPH_ENDPOINTS.joc` |
| joc-testnet | 1 | `SUBGRAPH_ENDPOINTS.joct` |
| mainnet | 0 | - |
| sepolia | 0 | - |

## Build Pipeline (Turborepo)

```
codegen ──────────────────────────────────────────┐
   │                                              │
   ▼                                              ▼
subgraph:codegen                          client:codegen
   │                                              │
   ▼                                              ▼
subgraph:build                            client:build
                                                  │
                                                  ▼
                                           react:build
```

## Performance Considerations

1. **No tokenURI fetching**: Removed to avoid indexing failures from oversized metadata
2. **Try-call pattern**: All contract calls use `try_*` methods to handle reverts gracefully
3. **Singleton pattern**: Global stats stored in single "all" entity to minimize reads
4. **Derived fields**: Token lists use `@derivedFrom` to avoid storing arrays
5. **Turborepo caching**: Build outputs cached for faster rebuilds
