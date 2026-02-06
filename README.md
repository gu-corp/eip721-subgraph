# EIP-721 Subgraph

A monorepo for indexing and querying ERC-721 (NFT) data using The Graph Protocol.

## Packages

| Package | Description | Documentation |
|---------|-------------|---------------|
| [@gu-corp/eip721-subgraph](./packages/subgraph) | The Graph subgraph for indexing ERC-721 transfers | [README](./packages/subgraph/README.md) |
| [@gu-corp/eip721-subgraph-client](./packages/client) | TypeScript client with urql for querying the subgraph | [README](./packages/client/README.md) |
| [@gu-corp/eip721-subgraph-react](./packages/react) | React hooks for the subgraph client | [README](./packages/react/README.md) |

## Installation

```bash
# Client package (framework-agnostic)
npm install @gu-corp/eip721-subgraph-client

# React package (includes client)
npm install @gu-corp/eip721-subgraph-react
```

## Quick Start

### Using the Client

```typescript
import {
  createSubgraphClient,
  SUBGRAPH_ENDPOINTS,
  getTokens,
} from '@gu-corp/eip721-subgraph-client';

const client = createSubgraphClient({ url: SUBGRAPH_ENDPOINTS[81] });
const { data } = await getTokens(client, { first: 10, skip: 0 });
```

### Using React Hooks

```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokens,
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
  // ...
}
```

### Fetching NFT Metadata

```typescript
// Client
import { fetchTokenMetadata } from '@gu-corp/eip721-subgraph-client';
const metadata = await fetchTokenMetadata('ipfs://Qm...');

// React
import { useTokenMetadata } from '@gu-corp/eip721-subgraph-react';
const { data: metadata } = useTokenMetadata('ipfs://Qm...');
```

## Available Endpoints

| Network | Endpoint |
|---------|----------|
| JOC (81) | `SUBGRAPH_ENDPOINTS[81]` |
| JOC Testnet (10081) | `SUBGRAPH_ENDPOINTS[10081]` |

## Features

- **Subgraph**: Indexes ERC-721 Transfer events, tracks ownership, contract metadata, and global statistics
- **Client**: Type-safe GraphQL queries, auto-generated types, urql integration
- **React**: Ready-to-use hooks for tokens, owners, contracts, and statistics
- **Components**: `TokenMedia` component for rendering NFT media with gateway fallback
- **Metadata Fetching**: IPFS/Arweave gateway fallback, caching (memory/localStorage)

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run codegen
pnpm codegen

# Clean build artifacts
pnpm clean

# Versioning
pnpm changeset
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) - System design and package structure
- [Conventions](./docs/CONVENTIONS.md) - Code and git conventions
- [Requirements](./docs/REQUIREMENTS.md) - Project requirements

## License

MIT
