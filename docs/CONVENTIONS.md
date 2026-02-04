# Coding Conventions

## Monorepo Structure

This project is a pnpm + Turborepo monorepo with two packages:
- `packages/subgraph` - AssemblyScript (The Graph)
- `packages/client` - TypeScript (Node.js/Browser)

---

## Subgraph Package (AssemblyScript)

### Language & Runtime

- **Language**: AssemblyScript (TypeScript-like syntax for WebAssembly)
- **Runtime**: The Graph Protocol's graph-ts library
- **Target**: WebAssembly (WASM)

### Type System

```typescript
// Use graph-ts types, not JavaScript natives
import { BigInt, Bytes, store } from '@graphprotocol/graph-ts';

// Correct
let count: BigInt = BigInt.fromI32(0);
let address: Bytes = Bytes.fromHexString('0x...');

// Incorrect - JavaScript types don't exist in AssemblyScript
let count: number = 0;  // Won't work
```

### Constants

```typescript
// Define constants at module level
let ZERO_ADDRESS_STRING = '0x0000000000000000000000000000000000000000';
let ZERO_ADDRESS: Bytes = Bytes.fromHexString(ZERO_ADDRESS_STRING) as Bytes;
let ZERO = BigInt.fromI32(0);
let ONE = BigInt.fromI32(1);
```

### Null Handling

```typescript
// Always check for null when loading entities
let entity = Entity.load(id);
if (entity == null) {
  entity = new Entity(id);
  // Initialize all required fields
}
```

### Contract Interaction - Always Use Try-Calls

```typescript
// Correct - handles reverts gracefully
let name = contract.try_name();
if (!name.reverted) {
  tokenContract.name = name.value;
}

// Incorrect - will fail on revert
let name = contract.name();  // Dangerous!
```

### Entity Update Patterns

```typescript
// Load-Create Pattern
let owner = Owner.load(address);
if (owner == null) {
  owner = new Owner(address);
  owner.numTokens = ZERO;
}
owner.numTokens = owner.numTokens.plus(ONE);
owner.save();

// Entity Removal
store.remove('Token', id);
```

---

## Client Package (TypeScript)

### Language & Runtime

- **Language**: TypeScript
- **Runtime**: Node.js / Browser
- **GraphQL Client**: urql

### File Structure

```
packages/client/src/
├── client.ts       # urql client factory
├── index.ts        # Package exports
├── types/          # Generated types (do not edit)
│   └── index.ts
└── queries/        # Query modules
    ├── index.ts
    ├── tokens.ts
    ├── owners.ts
    ├── contracts.ts
    └── statistics.ts
```

### Query Function Pattern

```typescript
import { gql } from '@urql/core';
import type { Client } from '@urql/core';

// 1. Define GraphQL document
export const GetTokenDocument = gql`
  query GetToken($id: ID!) {
    token(id: $id) {
      id
      tokenID
      owner { id }
    }
  }
`;

// 2. Define variables interface
export interface GetTokenVariables {
  id: string;
}

// 3. Export async function
export async function getToken(client: Client, variables: GetTokenVariables) {
  return client.query(GetTokenDocument, variables).toPromise();
}
```

### Client Factory Pattern

```typescript
import { Client, cacheExchange, fetchExchange } from '@urql/core';

export function createSubgraphClient(config: SubgraphClientConfig): Client {
  return new Client({
    url: config.url,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => ({
      headers: config.headers,
    }),
  });
}
```

### Type Generation

Types are auto-generated from `schema.graphql` using graphql-codegen:

```bash
pnpm --filter @gu-corp/eip721-subgraph-client codegen
```

**Never edit `src/types/index.ts` manually.**

---

## Shared Conventions

### Naming

| Item | Convention | Example |
|------|------------|---------|
| Entities | PascalCase | `TokenContract`, `OwnerPerTokenContract` |
| Fields | camelCase | `tokenID`, `mintTime`, `numTokens` |
| Functions | camelCase | `handleTransfer`, `getToken` |
| Files | kebab-case or camelCase | `mapping.ts`, `tokens.ts` |
| Constants | UPPER_SNAKE_CASE | `ZERO_ADDRESS_STRING` |

### Entity ID Conventions

```typescript
// Contract address as ID
let contractId = event.address.toHex();

// Composite IDs with underscore separator
let tokenId = contractAddress + '_' + tokenId.toString();
let ownerPerContractId = contractId + '_' + ownerAddress;

// Singleton entities use descriptive string
let all = All.load('all');
```

### GraphQL Schema

```graphql
type TokenContract @entity {
  id: ID!                                    # Always required
  name: String                               # Optional (no !)
  symbol: String                             # Optional
  numTokens: BigInt!                         # Required
  tokens: [Token!]! @derivedFrom(field: "contract")  # Derived
}
```

### Import Order

```typescript
// 1. External packages
import { gql } from '@urql/core';
import type { Client } from '@urql/core';

// 2. Internal types
import type { Token, Owner } from '../types';

// 3. Internal modules
import { createSubgraphClient } from '../client';
```

---

## Package Manager

Use **pnpm** exclusively:

```bash
# Install dependencies
pnpm install

# Run workspace commands
pnpm build                                    # Build all
pnpm --filter @gu-corp/eip721-subgraph build  # Build specific package

# Never use npm or yarn
```
