# @gu-corp/eip721-subgraph-react

React hooks for querying EIP-721 (NFT) subgraphs.

## Installation

```bash
npm install @gu-corp/eip721-subgraph-react
# or
pnpm add @gu-corp/eip721-subgraph-react
```

## Quick Start

```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokens,
} from '@gu-corp/eip721-subgraph-react';

function App() {
  return (
    <EIP721Provider config={{ url: SUBGRAPH_ENDPOINTS.joc }}>
      <TokenList />
    </EIP721Provider>
  );
}

function TokenList() {
  const { data, loading, error, refetch } = useTokens({ first: 10, skip: 0 });

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

## Provider Configuration

### Basic Configuration

```tsx
<EIP721Provider config={{ url: SUBGRAPH_ENDPOINTS.joc }}>
  {children}
</EIP721Provider>
```

### With Metadata Configuration

Configure global IPFS/Arweave gateways and caching for all metadata hooks:

```tsx
<EIP721Provider
  config={{
    url: SUBGRAPH_ENDPOINTS.joc,
    metadata: {
      ipfsGateways: ['https://my-gateway.com/ipfs/', 'https://ipfs.io/ipfs/'],
      arweaveGateways: ['https://arweave.net/'],
      timeout: 15000,
      cache: 'localStorage', // 'memory' | 'localStorage' | 'none'
      ttl: 3600000, // 1 hour
    },
  }}
>
  {children}
</EIP721Provider>
```

## Available Hooks

### Token Hooks

```tsx
import {
  useToken,
  useTokens,
  useTokensByOwner,
  useTokensByContract,
} from '@gu-corp/eip721-subgraph-react';

// Fetch single token by ID
const { data, loading, error, refetch } = useToken('0xcontract_123');

// Fetch tokens with pagination
const { data } = useTokens({ first: 10, skip: 0 });

// Fetch tokens by owner
const { data } = useTokensByOwner('0x...', { first: 10, skip: 0 });

// Fetch tokens by contract
const { data } = useTokensByContract('0x...', { first: 10, skip: 0 });
```

### Metadata Hooks

Fetch tokens with their NFT metadata from tokenURIs:

```tsx
import {
  useTokenMetadata,
  useTokenWithMetadata,
  useTokensWithMetadata,
  useTokensByOwnerWithMetadata,
  useTokensByContractWithMetadata,
} from '@gu-corp/eip721-subgraph-react';

// Fetch metadata directly from tokenURI
const { data: metadata, loading } = useTokenMetadata('ipfs://Qm...');

// Fetch token with metadata
const { data } = useTokenWithMetadata('0xcontract_123');
console.log(data?.metadata?.name, data?.metadata?.image);

// Fetch tokens with metadata
const { data } = useTokensWithMetadata({ first: 10, skip: 0 });

// Fetch owner's tokens with metadata
const { data } = useTokensByOwnerWithMetadata('0x...', { first: 10, skip: 0 });

// Fetch contract's tokens with metadata
const { data } = useTokensByContractWithMetadata('0x...', { first: 10, skip: 0 });
```

#### Override Global Options Per Hook

```tsx
// Override provider's metadata config for this hook only
const { data } = useTokenWithMetadata('0x..._1', {
  ipfsGateways: ['https://different-gateway.com/ipfs/'],
  timeout: 30000,
});
```

### Owner Hooks

```tsx
import {
  useOwner,
  useOwners,
  useOwnerPerTokenContracts,
} from '@gu-corp/eip721-subgraph-react';

// Fetch single owner
const { data } = useOwner('0x...');

// Fetch owners with pagination
const { data } = useOwners({ first: 10, skip: 0 });

// Fetch owner's contracts
const { data } = useOwnerPerTokenContracts('0x...', { first: 10, skip: 0 });
```

### Contract Hooks

```tsx
import {
  useTokenContract,
  useTokenContracts,
} from '@gu-corp/eip721-subgraph-react';

// Fetch single contract
const { data } = useTokenContract('0x...');

// Fetch contracts with pagination
const { data } = useTokenContracts({ first: 10, skip: 0 });
```

### Statistics Hook

```tsx
import { useGlobalStatistics } from '@gu-corp/eip721-subgraph-react';

const { data, loading, error } = useGlobalStatistics();
// data = { numTokenContracts: '42', numTokens: '1000', numOwners: '500' }
```

## Hook Return Type

All hooks return the same shape:

```typescript
interface UseQueryResult<T> {
  data: T | null;      // The fetched data
  loading: boolean;    // True while fetching
  error: Error | null; // Error if request failed
  refetch: () => void; // Function to refetch data
}
```

## Progressive Loading Pattern

For better performance with large collections, fetch tokens first, then load metadata individually:

```tsx
function TokenCard({ tokenURI }: { tokenURI: string }) {
  const { data: metadata, loading } = useTokenMetadata(tokenURI);

  if (loading) return <Skeleton />;

  return (
    <div>
      <img src={metadata?.image} alt={metadata?.name} />
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

## NFT Gallery Example

```tsx
import {
  EIP721Provider,
  SUBGRAPH_ENDPOINTS,
  useTokensWithMetadata,
} from '@gu-corp/eip721-subgraph-react';

function App() {
  return (
    <EIP721Provider
      config={{
        url: SUBGRAPH_ENDPOINTS.joc,
        metadata: {
          cache: 'localStorage',
          ttl: 3600000,
        },
      }}
    >
      <NFTGallery />
    </EIP721Provider>
  );
}

function NFTGallery() {
  const { data, loading, error } = useTokensWithMetadata({ first: 20, skip: 0 });

  if (loading) return <div>Loading NFTs...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {data?.map(token => (
        <div key={token.id} className="card">
          {token.metadata?.image && (
            <img src={token.metadata.image} alt={token.metadata.name} />
          )}
          <h3>{token.metadata?.name || `#${token.tokenID}`}</h3>
          <p>{token.contract.name}</p>
        </div>
      ))}
    </div>
  );
}
```

## Available Endpoints

| Network | Endpoint |
|---------|----------|
| JOC | `SUBGRAPH_ENDPOINTS.joc` |
| JOC Testnet | `SUBGRAPH_ENDPOINTS.joct` |

## License

MIT
