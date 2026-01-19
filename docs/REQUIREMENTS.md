# Requirements

## Functional Requirements

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

### NFR-3: Compatibility

| ID | Requirement |
|----|-------------|
| NFR-3.1 | Support multiple Transfer event signatures |
| NFR-3.2 | Support multiple EVM-compatible networks |
| NFR-3.3 | Handle contracts with non-standard implementations |

## Supported Networks

| Network | Chain ID | Status |
|---------|----------|--------|
| Ethereum Mainnet | 1 | Configured |
| Sepolia Testnet | 11155111 | Configured |
| JOC Mainnet | - | Configured (Default) |
| JOC Testnet | - | Configured |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @graphprotocol/graph-cli | ^0.96.0 | Build and deploy tooling |
| @graphprotocol/graph-ts | ^0.38.1 | AssemblyScript runtime library |

## Data Retention

- All indexed data is retained indefinitely
- Token entities are removed when burned (transferred to zero address)
- Owner entities persist even with zero token balance

## API Versioning

- Subgraph Spec Version: 0.0.5
- Mapping API Version: 0.0.7
