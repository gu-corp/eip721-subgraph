# Coding Conventions

## Language & Runtime

- **Language**: AssemblyScript (TypeScript-like syntax for WebAssembly)
- **Runtime**: The Graph Protocol's graph-ts library
- **Target**: WebAssembly (WASM)

## AssemblyScript Specifics

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

## Naming Conventions

### Files
- `mapping.ts` - Event handlers
- `schema.graphql` - Entity definitions
- `subgraph.yaml` - Manifest

### Entities (PascalCase)
```graphql
type TokenContract @entity { ... }
type OwnerPerTokenContract @entity { ... }
```

### Fields (camelCase)
```graphql
type Token @entity {
  tokenID: BigInt!
  mintTime: BigInt!
}
```

### Functions (camelCase)
```typescript
export function handleTransfer(event: Transfer): void { ... }
function supportsInterface(contract: EIP721, interfaceId: String): boolean { ... }
```

### Variables (camelCase)
```typescript
let tokenContract = TokenContract.load(contractId);
let currentOwnerPerTokenContractId = contractId + '_' + from;
```

## Entity ID Conventions

```typescript
// Contract address as ID
let contractId = event.address.toHex();

// Composite IDs with underscore separator
let tokenId = event.address.toHex() + '_' + tokenId.toString();
let ownerPerContractId = contractId + '_' + ownerAddress;

// Singleton entities use descriptive string
let all = All.load('all');
```

## Contract Interaction Patterns

### Always Use Try-Calls

```typescript
// Correct - handles reverts gracefully
let name = contract.try_name();
if (!name.reverted) {
  tokenContract.name = name.value;
}

// Incorrect - will fail on revert
let name = contract.name();  // Dangerous!
```

### Interface Detection

```typescript
function supportsInterface(
  contract: EIP721,
  interfaceId: String,
  expected: boolean = true,
): boolean {
  let supports = contract.try_supportsInterface(toBytes(interfaceId));
  return !supports.reverted && supports.value == expected;
}
```

## Entity Update Patterns

### Load-Create Pattern

```typescript
let owner = Owner.load(address);
if (owner == null) {
  owner = new Owner(address);
  owner.numTokens = ZERO;  // Initialize all fields
}
// Modify and save
owner.numTokens = owner.numTokens.plus(ONE);
owner.save();
```

### Counter Updates

```typescript
// Increment when count goes from 0 to 1
if (owner.numTokens.equals(ZERO)) {
  all.numOwners = all.numOwners.plus(ONE);
}
owner.numTokens = owner.numTokens.plus(ONE);

// Decrement when count goes from 1 to 0
if (owner.numTokens.equals(ONE)) {
  all.numOwners = all.numOwners.minus(ONE);
}
owner.numTokens = owner.numTokens.minus(ONE);
```

### Entity Removal

```typescript
// Use store.remove for burning tokens
store.remove('Token', id);
```

## GraphQL Schema Conventions

### Required vs Optional Fields

```graphql
type TokenContract @entity {
  id: ID!                                    # Always required
  name: String                               # Optional (no !)
  symbol: String                             # Optional
  numTokens: BigInt!                         # Required
}
```

### Derived Fields

```graphql
type TokenContract @entity {
  tokens: [Token!]! @derivedFrom(field: "contract")  # Derived from Token.contract
}
```

## Code Organization

### Import Order

```typescript
// 1. graph-ts imports
import { store, Bytes, BigInt } from '@graphprotocol/graph-ts';

// 2. Generated contract imports
import { Transfer, EIP721 } from '../generated/EIP721/EIP721';

// 3. Generated entity imports
import { Token, TokenContract, Owner, All } from '../generated/schema';
```

### Function Order

1. Module-level constants
2. Helper functions
3. Exported event handlers

## Comments

```typescript
// Use for clarifying non-obvious logic
if (from != ZERO_ADDRESS_STRING) {
  // existing token transfer, not minting
}

// Commented debug logging (keep for future debugging)
// log.error('contract : {}',[event.address.toHexString()]);
```
