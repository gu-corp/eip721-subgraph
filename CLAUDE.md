# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/claude-code) when working with code in this repository.

## Project Overview

This is a **monorepo** containing:
1. **@gu-corp/eip721-subgraph** - EIP-721 (NFT) subgraph for The Graph Protocol
2. **@gu-corp/eip721-subgraph-client** - TypeScript client library with urql for querying the subgraph
3. **@gu-corp/eip721-subgraph-react** - React hooks for the subgraph client

The monorepo uses **pnpm workspaces** with **Turborepo** for build orchestration.

## Repository Structure

```
eip721-subgraph/
├── packages/
│   ├── subgraph/                 # @gu-corp/eip721-subgraph
│   │   ├── src/mapping.ts        # Event handlers
│   │   ├── schema.graphql        # GraphQL entity definitions
│   │   ├── subgraph.yaml         # Subgraph manifest
│   │   ├── networks.json         # Network configurations
│   │   ├── abis/                 # Contract ABIs
│   │   └── generated/            # Auto-generated (do not edit)
│   │
│   ├── client/                   # @gu-corp/eip721-subgraph-client
│   │   ├── src/
│   │   │   ├── queries/          # GraphQL queries
│   │   │   ├── types/            # Generated TypeScript types
│   │   │   ├── metadata/         # Metadata fetching module
│   │   │   ├── client.ts         # urql client factory
│   │   │   └── index.ts          # Package exports
│   │   ├── codegen.ts            # GraphQL codegen config
│   │   └── package.json
│   │
│   └── react/                    # @gu-corp/eip721-subgraph-react
│       ├── src/
│       │   ├── hooks/            # React hooks
│       │   ├── context.tsx       # EIP721Provider context
│       │   └── index.ts          # Package exports
│       └── package.json
│
├── docs/                         # Documentation
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml           # pnpm workspace definition
├── turbo.json                    # Turborepo pipeline config
└── tsconfig.base.json            # Shared TypeScript config
```

## Common Commands

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run codegen for all packages
pnpm codegen

# Clean all build artifacts
pnpm clean

# Type check
pnpm typecheck

# Format code
pnpm format

# Versioning with changesets
pnpm changeset              # Create a new changeset
pnpm version                # Apply changesets and bump versions
pnpm release                # Build and publish packages

# Run command in specific package
pnpm --filter @gu-corp/eip721-subgraph <command>
pnpm --filter @gu-corp/eip721-subgraph-client <command>
pnpm --filter @gu-corp/eip721-subgraph-react <command>
```

## Key Concepts

### Subgraph Package

Indexes ERC-721 Transfer events and tracks:
- **All**: Global statistics (singleton entity)
- **Token**: Individual NFT with owner, mintTime, tokenURI
- **TokenContract**: Contract metadata (name, symbol)
- **Owner**: Address with token count
- **OwnerPerTokenContract**: Per-contract ownership stats

### Client Package

Provides type-safe GraphQL queries:
- Auto-generated TypeScript types from schema.graphql
- Pre-built queries for common operations
- urql client factory with network presets
- **Metadata fetching** with IPFS/Arweave gateway fallback and caching

Metadata functions:
- `fetchTokenMetadata(uri, options)` - Fetch metadata from tokenURI
- `getTokenWithMetadata(id)` - Get token with fetched metadata
- `getTokensWithMetadata(pagination)` - Get tokens with metadata
- `getTokensByOwnerWithMetadata(owner)` - Get tokens by owner with metadata
- `getTokensByContractWithMetadata(contract)` - Get tokens by contract with metadata

### React Package

Provides React hooks for the subgraph:
- `EIP721Provider` - Context provider with URL and metadata configuration
- Token hooks: `useToken`, `useTokens`, `useTokensByOwner`, `useTokensByContract`
- **Metadata hooks**: `useTokenMetadata`, `useTokenWithMetadata`, `useTokensWithMetadata`, `useTokensByOwnerWithMetadata`, `useTokensByContractWithMetadata`
- Owner hooks: `useOwner`, `useOwners`, `useOwnerPerTokenContracts`
- Contract hooks: `useTokenContract`, `useTokenContracts`
- Statistics: `useGlobalStatistics`

Provider metadata configuration (optional):
```tsx
<EIP721Provider config={{
  url: SUBGRAPH_ENDPOINTS[81],
  metadata: {
    ipfsGateways: ['https://my-gateway.com/ipfs/'],
    arweaveGateways: ['https://arweave.net/'],
    timeout: 10000,
    cache: 'localStorage', // 'memory' | 'localStorage' | 'none'
    ttl: 3600000,
  }
}}>
```

### Schema Sharing

The client package references `../subgraph/schema.graphql` in codegen.ts. This ensures types are always in sync with the subgraph schema.

## Development Workflow

1. Make schema changes in `packages/subgraph/schema.graphql`
2. Run `pnpm codegen` to regenerate types in both packages
3. Update queries in `packages/client/src/queries/` if needed
4. Update hooks in `packages/react/src/hooks/` if needed
5. Run `pnpm build` to verify everything compiles

## Important Notes

- The `generated/` directories are auto-generated - never edit manually
- Use `pnpm` exclusively (not npm or yarn)
- Turborepo caches builds - use `pnpm clean` if you encounter stale artifacts
- The client package has the subgraph schema as a dependency via relative path
- The react package depends on the client package
