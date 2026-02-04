# Requirements

## Package Overview

| Package | Purpose |
|---------|---------|
| `@gu-corp/eip721-subgraph` | The Graph Protocol indexer for ERC-721 |
| `@gu-corp/eip721-subgraph-client` | TypeScript client with urql |

---

## Subgraph Package Requirements

### FR-1: Token Transfer Tracking

The subgraph MUST index all ERC-721 Transfer events and maintain accurate token ownership records.

| ID | Requirement |
|----|-------------|
| FR-1.1 | Track token transfers between addresses |
| FR-1.2 | Handle minting (transfer from zero address) |
| FR-1.3 | Handle burning (transfer to zero address) |
| FR-1.4 | Store token creation timestamp (mintTime) |

### FR-2: EIP-721 Compliance Validation

The subgraph MUST validate that contracts implement the EIP-721 standard before indexing.

| ID | Requirement |
|----|-------------|
| FR-2.1 | Verify EIP-165 support (interface 0x01ffc9a7) |
| FR-2.2 | Verify EIP-721 support (interface 0x80ac58cd) |
| FR-2.3 | Verify null interface returns false (0x00000000) |
| FR-2.4 | Detect EIP-721 Metadata extension support (0x5b5e139f) |
| FR-2.5 | Skip non-compliant contracts silently |

### FR-3: Contract Metadata

The subgraph MUST store contract-level metadata when available.

| ID | Requirement |
|----|-------------|
| FR-3.1 | Store contract name (if available) |
| FR-3.2 | Store contract symbol (if available) |
| FR-3.3 | Track whether contract supports metadata extension |
| FR-3.4 | Track doAllAddressesOwnTheirIdByDefault flag |

### FR-4: Ownership Statistics

The subgraph MUST maintain accurate ownership statistics at multiple levels.

| ID | Requirement |
|----|-------------|
| FR-4.1 | Track total tokens per owner (global) |
| FR-4.2 | Track tokens per owner per contract |
| FR-4.3 | Track total tokens per contract |
| FR-4.4 | Track unique owners per contract |
| FR-4.5 | Track global statistics (total tokens, owners, contracts) |

### FR-5: Query Capabilities

The subgraph MUST expose a GraphQL API for querying indexed data.

| ID | Requirement |
|----|-------------|
| FR-5.1 | Query tokens by owner address |
| FR-5.2 | Query tokens by contract address |
| FR-5.3 | Query token details by ID |
| FR-5.4 | Query contract metadata |
| FR-5.5 | Query global statistics |
| FR-5.6 | Support pagination on token lists |

---

## Client Package Requirements

### FR-6: Type Safety

The client MUST provide type-safe access to subgraph data.

| ID | Requirement |
|----|-------------|
| FR-6.1 | Generate TypeScript types from schema.graphql |
| FR-6.2 | Provide typed query functions |
| FR-6.3 | Export all entity types |

### FR-7: Query Functions

The client MUST provide pre-built query functions.

| ID | Requirement |
|----|-------------|
| FR-7.1 | `getToken(id)` - Get single token |
| FR-7.2 | `getTokens(pagination)` - Get paginated tokens |
| FR-7.3 | `getTokensByOwner(owner)` - Get tokens by owner |
| FR-7.4 | `getTokensByContract(contract)` - Get tokens by contract |
| FR-7.5 | `getOwner(id)` - Get owner details |
| FR-7.6 | `getTokenContract(id)` - Get contract details |
| FR-7.7 | `getGlobalStatistics()` - Get global stats |

### FR-8: Client Configuration

The client MUST support flexible configuration.

| ID | Requirement |
|----|-------------|
| FR-8.1 | Support custom subgraph endpoint URL |
| FR-8.2 | Support custom headers for authentication |
| FR-8.3 | Provide network preset endpoints |
| FR-8.4 | Support custom fetch implementation (for SSR) |

---

## Non-Functional Requirements

### NFR-1: Reliability

| ID | Requirement |
|----|-------------|
| NFR-1.1 | Handle contract call reverts gracefully |
| NFR-1.2 | Continue indexing if metadata calls fail |
| NFR-1.3 | Maintain data consistency across related entities |

### NFR-2: Performance

| ID | Requirement |
|----|-------------|
| NFR-2.1 | Avoid fetching tokenURI (can cause oversized data issues) |
| NFR-2.2 | Use singleton pattern for global statistics |
| NFR-2.3 | Use derived fields instead of storing arrays |
| NFR-2.4 | Client uses document caching via urql |

### NFR-3: Compatibility

| ID | Requirement |
|----|-------------|
| NFR-3.1 | Support multiple Transfer event signatures |
| NFR-3.2 | Support multiple EVM-compatible networks |
| NFR-3.3 | Handle contracts with non-standard implementations |
| NFR-3.4 | Client supports ESM and CommonJS |
| NFR-3.5 | Client supports Node.js and browsers |

---

## Supported Networks

| Network | Start Block | Status |
|---------|-------------|--------|
| Ethereum Mainnet | 0 | Configured |
| Sepolia Testnet | 0 | Configured |
| JOC Mainnet | 1 | Configured (Default) |
| JOC Testnet | 1 | Configured |

---

## Dependencies

### Subgraph Package

| Package | Version | Purpose |
|---------|---------|---------|
| @graphprotocol/graph-cli | ^0.96.0 | Build and deploy tooling |
| @graphprotocol/graph-ts | ^0.38.1 | AssemblyScript runtime library |

### Client Package

| Package | Version | Purpose |
|---------|---------|---------|
| @urql/core | ^5.0.0 | GraphQL client |
| graphql | ^16.8.1 | GraphQL parsing |
| @graphql-codegen/cli | ^5.0.2 | Type generation |
| tsup | ^8.0.2 | Build tool |

### Root (Monorepo)

| Package | Version | Purpose |
|---------|---------|---------|
| turbo | ^2.3.0 | Build orchestration |
| prettier | ^3.2.5 | Code formatting |
| pnpm | 9.x | Package manager |

---

## Data Retention

- All indexed data is retained indefinitely
- Token entities are removed when burned (transferred to zero address)
- Owner entities persist even with zero token balance

## API Versioning

- Subgraph Spec Version: 0.0.5
- Mapping API Version: 0.0.7
