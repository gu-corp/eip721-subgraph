# @gu-corp/eip721-subgraph-client

TypeScript client library for querying EIP-721 (NFT) subgraphs using urql.

## Installation

```bash
npm install @gu-corp/eip721-subgraph-client
# or
pnpm add @gu-corp/eip721-subgraph-client
```

## Quick Start

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

## Available Endpoints

| Network | Endpoint |
|---------|----------|
| JOC | `SUBGRAPH_ENDPOINTS.joc` |
| JOC Testnet | `SUBGRAPH_ENDPOINTS.joct` |

Or use a custom URL:

```typescript
const client = createSubgraphClient({
  url: 'https://your-subgraph-endpoint.com/subgraphs/name/eip721',
});
```

## Query Functions

### Token Queries

```typescript
import {
  getToken,
  getTokens,
  getTokensByOwner,
  getTokensByContract,
} from '@gu-corp/eip721-subgraph-client';

// Get single token by ID
const { data } = await getToken(client, { id: '0xcontract_123' });

// Get tokens with pagination
const { data } = await getTokens(client, {
  first: 10,
  skip: 0,
  orderBy: 'mintTime',
  orderDirection: 'desc',
});

// Get tokens by owner
const { data } = await getTokensByOwner(client, {
  owner: '0x...',
  first: 10,
  skip: 0,
});

// Get tokens by contract
const { data } = await getTokensByContract(client, {
  contract: '0x...',
  first: 10,
  skip: 0,
});
```

### Owner Queries

```typescript
import {
  getOwner,
  getOwners,
  getOwnerPerTokenContracts,
} from '@gu-corp/eip721-subgraph-client';

// Get single owner
const { data } = await getOwner(client, { id: '0x...' });

// Get owners with pagination
const { data } = await getOwners(client, { first: 10, skip: 0 });

// Get owner's contracts
const { data } = await getOwnerPerTokenContracts(client, {
  owner: '0x...',
  first: 10,
  skip: 0,
});
```

### Contract Queries

```typescript
import {
  getTokenContract,
  getTokenContracts,
} from '@gu-corp/eip721-subgraph-client';

// Get single contract
const { data } = await getTokenContract(client, { id: '0x...' });

// Get contracts with pagination
const { data } = await getTokenContracts(client, { first: 10, skip: 0 });
```

### Statistics

```typescript
import { getGlobalStatistics } from '@gu-corp/eip721-subgraph-client';

const { data } = await getGlobalStatistics(client);
console.log(data?.all);
// { numTokenContracts: '42', numTokens: '1000', numOwners: '500' }
```

## Metadata Fetching

Fetch NFT metadata from tokenURIs with IPFS/Arweave gateway support:

```typescript
import {
  fetchTokenMetadata,
  getTokenWithMetadata,
  getTokensWithMetadata,
} from '@gu-corp/eip721-subgraph-client';

// Fetch metadata directly from tokenURI
const metadata = await fetchTokenMetadata('ipfs://Qm.../metadata.json');
console.log(metadata.name, metadata.image);

// Fetch metadata with custom options
const metadata = await fetchTokenMetadata('ipfs://Qm...', {
  ipfsGateways: ['https://my-gateway.com/ipfs/'],
  timeout: 15000,
  cache: 'localStorage',
});

// Get token with metadata
const { data } = await getTokenWithMetadata(client, { id: '0x..._1' });
console.log(data?.metadata?.name);

// Get tokens with metadata
const { data } = await getTokensWithMetadata(client, { first: 10, skip: 0 });
data?.forEach(token => console.log(token.metadata?.name));
```

### Metadata Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ipfsGateways` | `string[]` | Multiple defaults | IPFS gateways to try (in order) |
| `arweaveGateways` | `string[]` | `['https://arweave.net/']` | Arweave gateways |
| `timeout` | `number` | `10000` | Request timeout per gateway (ms) |
| `cache` | `'memory' \| 'localStorage' \| 'none'` | `'memory'` | Cache strategy |
| `ttl` | `number` | `3600000` | Cache TTL (ms) |

### Default IPFS Gateways

The client tries these gateways in order:
1. `https://ipfs.io/ipfs/`
2. `https://cloudflare-ipfs.com/ipfs/`
3. `https://gateway.pinata.cloud/ipfs/`
4. `https://dweb.link/ipfs/`
5. `https://w3s.link/ipfs/`
6. `https://4everland.io/ipfs/`
7. `https://ipfs.filebase.io/ipfs/`
8. `https://flk-ipfs.xyz/ipfs/`
9. `https://ipfs.runfission.com/ipfs/`

### Creating a Reusable Fetcher

```typescript
import { createMetadataFetcher } from '@gu-corp/eip721-subgraph-client';

const fetcher = createMetadataFetcher({
  ipfsGateways: ['https://my-gateway.com/ipfs/'],
  cache: 'localStorage',
  ttl: 3600000,
});

const metadata = await fetcher.fetch('ipfs://Qm...');
fetcher.clearCache(); // Clear cached metadata
```

## TypeScript Support

All functions are fully typed. Types are generated from the subgraph schema:

```typescript
import type {
  Token,
  Owner,
  TokenContract,
  All,
} from '@gu-corp/eip721-subgraph-client';
```

## License

MIT
