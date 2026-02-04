import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    // Define custom scalars used by The Graph
    `
      scalar BigInt
      scalar Bytes
      scalar Int8
    `,
    // Load the actual schema
    '../subgraph/schema.graphql',
  ],
  generates: {
    'src/types/index.ts': {
      plugins: ['typescript'],
      config: {
        scalars: {
          BigInt: 'string',
          Bytes: 'string',
          Int8: 'number',
          ID: 'string',
        },
        enumsAsTypes: true,
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: true,
          defaultValue: true,
        },
        maybeValue: 'T | null',
      },
    },
  },
};

export default config;
