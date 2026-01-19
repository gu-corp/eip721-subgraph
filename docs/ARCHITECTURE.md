# Architecture

## System Overview

This subgraph is built on The Graph Protocol and indexes ERC-721 (NFT) Transfer events from any contract on the target blockchain. It provides a queryable GraphQL API for NFT ownership data.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Blockchain    │────▶│   Graph Node     │────▶│   GraphQL API   │
│  (ERC-721 TXs)  │     │  (Indexing)      │     │   (Queries)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │   PostgreSQL     │
                        │   (Entity Store) │
                        └──────────────────┘
```

## Data Flow

### Event Processing Pipeline

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

## Entity Relationships

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

## EIP-721 Compliance Validation

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

## ID Schemes

| Entity | ID Format | Example |
|--------|-----------|---------|
| All | `"all"` | `"all"` |
| Token | `{contract}_{tokenId}` | `"0xabc...123_42"` |
| TokenContract | `{contract}` | `"0xabc...123"` |
| Owner | `{address}` | `"0xdef...456"` |
| OwnerPerTokenContract | `{contract}_{owner}` | `"0xabc...123_0xdef...456"` |

## Supported Networks

Configured in `networks.json`:

| Network | Start Block |
|---------|-------------|
| mainnet | 0 |
| sepolia | 0 |
| joc | 0 |
| joc-testnet | 0 |

## Performance Considerations

1. **No tokenURI fetching**: Removed to avoid indexing failures from oversized metadata
2. **Try-call pattern**: All contract calls use `try_*` methods to handle reverts gracefully
3. **Singleton pattern**: Global stats stored in single "all" entity to minimize reads
4. **Derived fields**: Token lists use `@derivedFrom` to avoid storing arrays
