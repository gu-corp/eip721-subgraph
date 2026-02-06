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
┌───────────────────────────────────────────────────────────────┐
│                       Client Package                           │
├───────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐  │
│  │   Types   │  │  Queries  │  │  Client   │  │ Metadata  │  │
│  │ (codegen) │  │ (tokens,  │  │ (urql +   │  │ (fetcher, │  │
│  │           │  │  owners,  │  │  presets) │  │  cache)   │  │
│  │           │  │  stats)   │  │           │  │           │  │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘  │
└───────────────────────────────────────────────────────────────┘
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
| `getTokenWithMetadata(id)` | Get token with fetched metadata |
| `getTokensWithMetadata(pagination)` | Get tokens with metadata |
| `getTokensByOwnerWithMetadata(owner)` | Get tokens by owner with metadata |
| `getTokensByContractWithMetadata(contract)` | Get tokens by contract with metadata |
| `getOwner(id)` | Get owner by address |
| `getOwners(pagination)` | Get paginated owners |
| `getTokenContract(id)` | Get contract metadata |
| `getTokenContracts(pagination)` | Get paginated contracts |
| `getGlobalStatistics()` | Get global stats |

### Metadata Fetching

The client package includes a metadata module for fetching NFT metadata from tokenURIs:

```
┌─────────────────────────────────────────────────────────────────┐
│                    Metadata Module                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  tokenURI ──▶ resolveTokenURI() ──▶ fetchWithTimeout()          │
│                     │                      │                     │
│                     ▼                      ▼                     │
│              ┌─────────────┐        ┌─────────────┐             │
│              │  Gateway    │        │   Cache     │             │
│              │  Fallback   │        │  (memory/   │             │
│              │  (IPFS,     │        │  localStorage)            │
│              │   Arweave)  │        │             │             │
│              └─────────────┘        └─────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Supported URI Protocols:**
- `ipfs://` - IPFS protocol (uses gateway fallback)
- `/ipfs/` - IPFS path format
- `ar://` - Arweave protocol
- `data:` - Data URIs (base64 and JSON)
- `http://`, `https://` - Direct HTTP(S) URLs

**Default IPFS Gateways:**
- `https://ipfs.io/ipfs/`
- `https://cloudflare-ipfs.com/ipfs/`
- `https://gateway.pinata.cloud/ipfs/`
- `https://dweb.link/ipfs/`
- `https://w3s.link/ipfs/`
- `https://4everland.io/ipfs/`
- `https://ipfs.filebase.io/ipfs/`
- `https://flk-ipfs.xyz/ipfs/`
- `https://ipfs.runfission.com/ipfs/`

**Metadata Functions:**

| Function | Description |
|----------|-------------|
| `fetchTokenMetadata(uri, options)` | Fetch metadata from tokenURI |
| `resolveTokenURI(uri, options)` | Convert URI to HTTP URLs |
| `createMetadataFetcher(config)` | Create reusable fetcher with config |
| `createMemoryCache(ttl)` | Create in-memory cache |
| `createLocalStorageCache(prefix, ttl)` | Create localStorage cache |

## Package: React

### Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        React Package                               │
├───────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────────────────────────┐│
│  │      Context      │  │              Hooks                    ││
│  │───────────────────│  │───────────────────────────────────────││
│  │ EIP721Provider    │  │ Token: useToken, useTokens            ││
│  │  - url            │  │        useTokensByOwner/Contract      ││
│  │  - metadata config│  │                                       ││
│  │    - ipfsGateways │  │ Metadata: useTokenWithMetadata        ││
│  │    - arweaveGws   │  │           useTokensWithMetadata       ││
│  │    - timeout      │  │           useTokensByOwner/Contract-  ││
│  │    - cache        │  │               WithMetadata            ││
│  │    - ttl          │  │           useTokenMetadata            ││
│  │                   │  │                                       ││
│  │                   │  │ Owner: useOwner, useOwners            ││
│  │                   │  │        useOwnerPerTokenContracts      ││
│  │                   │  │                                       ││
│  │                   │  │ Contract: useTokenContract(s)         ││
│  │                   │  │ Stats: useGlobalStatistics            ││
│  └───────────────────┘  └───────────────────────────────────────┘│
│  ┌───────────────────────────────────────────────────────────────┐│
│  │                    Components                                 ││
│  │───────────────────────────────────────────────────────────────││
│  │ TokenMedia: Renders NFT media (image/video) from tokenURI    ││
│  │   - Fetches metadata → resolves image/animation_url          ││
│  │   - IPFS/Arweave gateway fallback with timeout               ││
│  │   - Auto-detects video vs image from metadata                ││
│  └───────────────────────────────────────────────────────────────┘│
└───────────────────────────────────────────────────────────────────┘
```

### React Hooks

**Token Hooks:**
| Hook | Description |
|------|-------------|
| `useToken(id)` | Fetch single token |
| `useTokens(options)` | Fetch tokens with pagination |
| `useTokensByOwner(owner)` | Fetch tokens by owner |
| `useTokensByContract(contract)` | Fetch tokens by contract |

**Metadata Hooks:**
| Hook | Description |
|------|-------------|
| `useTokenMetadata(tokenURI)` | Fetch metadata from tokenURI directly |
| `useTokenWithMetadata(id)` | Fetch token with metadata |
| `useTokensWithMetadata(options)` | Fetch tokens with metadata |
| `useTokensByOwnerWithMetadata(owner)` | Fetch tokens by owner with metadata |
| `useTokensByContractWithMetadata(contract)` | Fetch tokens by contract with metadata |

**Other Hooks:**
| Hook | Description |
|------|-------------|
| `useOwner(id)` | Fetch single owner |
| `useOwners(options)` | Fetch owners with pagination |
| `useOwnerPerTokenContracts(owner)` | Fetch contracts owned by address |
| `useTokenContract(id)` | Fetch single contract |
| `useTokenContracts(options)` | Fetch contracts with pagination |
| `useGlobalStatistics()` | Fetch total contracts, tokens, owners |

### Components

**TokenMedia:**

Renders NFT media (image or video) from a tokenURI with IPFS/Arweave gateway fallback.

```
tokenURI → useTokenMetadata() → metadata.image / metadata.animation_url
                                        ↓
                              resolveTokenURI() → [gateway1, gateway2, ...]
                                        ↓
                              <img> or <video> with auto-retry on error/timeout
```

- `mediaType='auto'` (default): renders `<video>` if `animation_url` exists, `<img>` otherwise
- `mediaType='image'`: always `<img>` using `metadata.image`
- `mediaType='video'`: always `<video>` using `metadata.animation_url`
- `fallbackSrc`: direct URL used when all gateways are exhausted

### Usage Example

**Basic usage:**
```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokens
} from '@gu-corp/eip721-subgraph-react';

function App() {
  return (
    <EIP721Provider config={{ url: SUBGRAPH_ENDPOINTS[81] }}>
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

**With global metadata configuration:**
```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokensWithMetadata
} from '@gu-corp/eip721-subgraph-react';

function App() {
  return (
    <EIP721Provider
      config={{
        url: SUBGRAPH_ENDPOINTS[81],
        metadata: {
          ipfsGateways: ['https://my-gateway.com/ipfs/', 'https://ipfs.io/ipfs/'],
          timeout: 15000,
          cache: 'localStorage',
          ttl: 3600000, // 1 hour
        },
      }}
    >
      <NFTGallery />
    </EIP721Provider>
  );
}

function NFTGallery() {
  const { data, loading } = useTokensWithMetadata({ first: 10, skip: 0 });

  return (
    <div>
      {data?.map(token => (
        <div key={token.id}>
          <img src={token.metadata?.image} alt={token.metadata?.name} />
          <p>{token.metadata?.name}</p>
        </div>
      ))}
    </div>
  );
}
```

**Progressive loading pattern (for better performance):**
```tsx
function TokenCard({ tokenURI }: { tokenURI: string }) {
  // Load metadata individually per token
  const { data: metadata, loading } = useTokenMetadata(tokenURI);

  if (loading) return <Skeleton />;

  return (
    <div>
      <img src={metadata?.image} />
      <p>{metadata?.name}</p>
    </div>
  );
}

function TokenList() {
  // First fetch tokens without metadata (fast)
  const { data: tokens } = useTokensByOwner(ownerAddress);

  return (
    <div>
      {tokens?.map(token => (
        <TokenCard key={token.id} tokenURI={token.tokenURI} />
      ))}
    </div>
  );
}
```

## Supported Networks

Configured in `packages/subgraph/networks.json`:

| Network | Start Block | Endpoint |
|---------|-------------|----------|
| joc | 1 | `SUBGRAPH_ENDPOINTS[81]` |
| joc-testnet | 1 | `SUBGRAPH_ENDPOINTS[10081]` |
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
