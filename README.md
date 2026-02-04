# EIP-721 Subgraph

A monorepo for indexing and querying ERC-721 (NFT) data using The Graph Protocol.

## Packages

| Package | Description |
|---------|-------------|
| [@gu-corp/eip721-subgraph](./packages/subgraph) | The Graph subgraph for indexing ERC-721 transfers |
| [@gu-corp/eip721-subgraph-client](./packages/client) | TypeScript client with urql for querying the subgraph |
| [@gu-corp/eip721-subgraph-react](./packages/react) | React hooks for the subgraph client |

## Installation

```bash
# Client package (framework-agnostic)
npm install @gu-corp/eip721-subgraph-client

# React package (includes client)
npm install @gu-corp/eip721-subgraph-react
```

## Quick Start

### Using the Client (Node.js, Vue, Svelte, etc.)

```typescript
import {
  createSubgraphClient,
  SUBGRAPH_ENDPOINTS,
  getTokens,
  getTokensByOwner,
} from '@gu-corp/eip721-subgraph-client';

// Create client
const client = createSubgraphClient({
  url: SUBGRAPH_ENDPOINTS.joc,
});

// Fetch tokens
const { data } = await getTokens(client, { first: 10, skip: 0 });
console.log(data?.tokens);

// Fetch tokens by owner
const { data: ownerTokens } = await getTokensByOwner(client, {
  owner: '0x...',
  first: 10,
  skip: 0,
});
```

### Using React Hooks

```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokens,
  useTokensByOwner,
  useGlobalStatistics,
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
        <li key={token.id}>
          {token.contract.name} #{token.tokenID}
        </li>
      ))}
    </ul>
  );
}
```

## Available Endpoints

| Network | Endpoint |
|---------|----------|
| JOC | `SUBGRAPH_ENDPOINTS.joc` |
| JOC Testnet | `SUBGRAPH_ENDPOINTS.joct` |

## React Hooks

| Hook | Description |
|------|-------------|
| `useToken(id)` | Fetch single token |
| `useTokens(options)` | Fetch tokens with pagination |
| `useTokensByOwner(owner)` | Fetch tokens by owner address |
| `useTokensByContract(contract)` | Fetch tokens by contract address |
| `useOwner(id)` | Fetch single owner |
| `useOwners(options)` | Fetch owners with pagination |
| `useOwnerPerTokenContracts(owner)` | Fetch contracts owned by address |
| `useTokenContract(id)` | Fetch single contract |
| `useTokenContracts(options)` | Fetch contracts with pagination |
| `useGlobalStatistics()` | Fetch total contracts, tokens, owners |

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
```

## Subgraph Deployment

```bash
NETWORK_NAME=xxx START_BLOCK=xxx SUBGRAPH_NAME=xxx GRAPH_NODE_URL=xxx IPFS_URL=xxx VERSION=xxx sh deploy.sh
```

Parameters:
- `NETWORK_NAME`: Deployed network name in Graphnode
- `START_BLOCK`: Start block
- `SUBGRAPH_NAME`: Subgraph name
- `GRAPH_NODE_URL`: Graphnode admin URL
- `IPFS_URL`: IPFS URL
- `VERSION`: Subgraph version (e.g., v1.0.0)

Example:
```bash
NETWORK_NAME=joc START_BLOCK=1 SUBGRAPH_NAME=gu-corp/eip721 GRAPH_NODE_URL=http://localhost:8020/ IPFS_URL=http://localhost:5001/ VERSION=v1.0.0 sh deploy.sh
```

## GraphQL Query Examples

```graphql
# Get tokens with pagination
{
  tokens(first: 10, orderBy: mintTime, orderDirection: desc) {
    id
    tokenID
    tokenURI
    mintTime
    owner {
      id
    }
    contract {
      id
      name
      symbol
    }
  }
}

# Get tokens by owner
{
  tokens(where: { owner: "0x..." }) {
    tokenID
    contract {
      name
    }
  }
}

# Get global statistics
{
  all(id: "all") {
    numTokenContracts
    numTokens
    numOwners
  }
}
```

## License

MIT
