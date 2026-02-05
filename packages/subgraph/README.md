# @gu-corp/eip721-subgraph

A subgraph for indexing ERC-721 (NFT) Transfer events using The Graph Protocol.

## Overview

This subgraph indexes all ERC-721 Transfer events and tracks:
- Token ownership and transfers
- Contract metadata (name, symbol)
- Owner statistics (token counts)
- Global statistics (total tokens, contracts, owners)

## Entities

### All (Global Statistics)

Singleton entity (id: "all") containing aggregate statistics.

| Field | Type | Description |
|-------|------|-------------|
| numTokenContracts | BigInt | Total ERC-721 contracts |
| numTokens | BigInt | Total NFTs minted |
| numOwners | BigInt | Total unique owners |

### Token

Individual NFT entity.

| Field | Type | Description |
|-------|------|-------------|
| id | ID | `{contract}_{tokenId}` |
| tokenID | BigInt | Token ID within contract |
| tokenURI | String | Token metadata URI (optional) |
| mintTime | BigInt | Block timestamp of mint |
| owner | Owner | Current owner |
| contract | TokenContract | Parent contract |

### TokenContract

ERC-721 contract entity.

| Field | Type | Description |
|-------|------|-------------|
| id | ID | Contract address |
| name | String | Contract name (optional) |
| symbol | String | Contract symbol (optional) |
| numTokens | BigInt | Total tokens in contract |
| numOwners | BigInt | Unique owners in contract |
| supportsMetadata | Boolean | Supports ERC-721 Metadata |

### Owner

Token owner entity.

| Field | Type | Description |
|-------|------|-------------|
| id | ID | Owner address |
| numTokens | BigInt | Total tokens owned |
| tokens | [Token] | Derived: owned tokens |

### OwnerPerTokenContract

Per-contract ownership tracking.

| Field | Type | Description |
|-------|------|-------------|
| id | ID | `{contract}_{owner}` |
| contract | TokenContract | The contract |
| owner | Owner | The owner |
| numTokens | BigInt | Tokens owned in this contract |

## Deployment

### Using deploy script

```bash
NETWORK_NAME=xxx \
START_BLOCK=xxx \
SUBGRAPH_NAME=xxx \
GRAPH_NODE_URL=xxx \
IPFS_URL=xxx \
VERSION=xxx \
sh deploy.sh
```

Parameters:
- `NETWORK_NAME`: Network name configured in Graph Node
- `START_BLOCK`: Block to start indexing from
- `SUBGRAPH_NAME`: Subgraph name (e.g., `gu-corp/eip721`)
- `GRAPH_NODE_URL`: Graph Node admin URL
- `IPFS_URL`: IPFS URL for deployment
- `VERSION`: Version label (e.g., `v1.0.0`)

Example:
```bash
NETWORK_NAME=joc \
START_BLOCK=1 \
SUBGRAPH_NAME=gu-corp/eip721 \
GRAPH_NODE_URL=http://localhost:8020/ \
IPFS_URL=http://localhost:5001/ \
VERSION=v1.0.0 \
sh deploy.sh
```

### Manual deployment

```bash
# Generate types
pnpm codegen

# Build
pnpm build

# Deploy
graph deploy --node <GRAPH_NODE_URL> --ipfs <IPFS_URL> <SUBGRAPH_NAME>
```

## Network Configuration

Networks are configured in `networks.json`:

```json
{
  "joc": {
    "EIP721": {
      "address": "0x0000000000000000000000000000000000000000",
      "startBlock": 1
    }
  },
  "joc-testnet": {
    "EIP721": {
      "address": "0x0000000000000000000000000000000000000000",
      "startBlock": 1
    }
  }
}
```

## GraphQL Query Examples

### Get tokens with pagination

```graphql
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
```

### Get tokens by owner

```graphql
{
  tokens(where: { owner: "0x..." }) {
    tokenID
    contract {
      name
    }
  }
}
```

### Get owner statistics

```graphql
{
  owner(id: "0x...") {
    id
    numTokens
    tokens(first: 10) {
      tokenID
      contract {
        name
      }
    }
  }
}
```

### Get contract information

```graphql
{
  tokenContract(id: "0x...") {
    id
    name
    symbol
    numTokens
    numOwners
    supportsMetadata
  }
}
```

### Get global statistics

```graphql
{
  all(id: "all") {
    numTokenContracts
    numTokens
    numOwners
  }
}
```

## EIP-721 Compliance

The subgraph validates ERC-721 compliance before indexing:

```
supportsInterface(0x01ffc9a7) == true   // EIP-165
supportsInterface(0x80ac58cd) == true   // EIP-721
supportsInterface(0x00000000) == false  // Null check
```

Optional metadata extension detection:
```
supportsInterface(0x5b5e139f) == true   // EIP-721 Metadata
```

## Development

```bash
# Install dependencies
pnpm install

# Generate types
pnpm codegen

# Build
pnpm build

# Clean
pnpm clean
```

## License

MIT
