import { gql } from '@urql/core';
import type { Client } from '@urql/core';
import { fetchTokenMetadata, type FetchMetadataOptions, type NFTMetadata } from '../metadata';

export const GetTokenDocument = gql`
  query GetToken($id: ID!) {
    token(id: $id) {
      id
      tokenID
      mintTime
      tokenURI
      owner {
        id
        numTokens
      }
      contract {
        id
        name
        symbol
      }
    }
  }
`;

export const GetTokensDocument = gql`
  query GetTokens(
    $first: Int!
    $skip: Int!
    $orderBy: Token_orderBy
    $orderDirection: OrderDirection
  ) {
    tokens(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      tokenID
      mintTime
      tokenURI
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
`;

export const GetTokensByOwnerDocument = gql`
  query GetTokensByOwner($owner: String!, $first: Int!, $skip: Int!) {
    tokens(
      first: $first
      skip: $skip
      where: { owner: $owner }
      orderBy: mintTime
      orderDirection: desc
    ) {
      id
      tokenID
      mintTime
      tokenURI
      contract {
        id
        name
        symbol
      }
    }
  }
`;

export const GetTokensByContractDocument = gql`
  query GetTokensByContract($contract: String!, $first: Int!, $skip: Int!) {
    tokens(
      first: $first
      skip: $skip
      where: { contract: $contract }
      orderBy: tokenID
      orderDirection: asc
    ) {
      id
      tokenID
      mintTime
      tokenURI
      owner {
        id
      }
    }
  }
`;

export interface GetTokenVariables {
  id: string;
}

export interface GetTokensVariables {
  first: number;
  skip: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface GetTokensByOwnerVariables {
  owner: string;
  first: number;
  skip: number;
}

export interface GetTokensByContractVariables {
  contract: string;
  first: number;
  skip: number;
}

export async function getToken(client: Client, variables: GetTokenVariables) {
  return client.query(GetTokenDocument, variables).toPromise();
}

export async function getTokens(client: Client, variables: GetTokensVariables) {
  return client.query(GetTokensDocument, variables).toPromise();
}

export async function getTokensByOwner(
  client: Client,
  variables: GetTokensByOwnerVariables
) {
  return client.query(GetTokensByOwnerDocument, variables).toPromise();
}

export async function getTokensByContract(
  client: Client,
  variables: GetTokensByContractVariables
) {
  return client.query(GetTokensByContractDocument, variables).toPromise();
}

export interface TokenWithMetadata {
  id: string;
  tokenID: string;
  mintTime: string;
  tokenURI: string | null;
  owner: { id: string; numTokens?: string };
  contract: { id: string; name: string | null; symbol: string | null };
  metadata: NFTMetadata | null;
}

export interface GetTokenWithMetadataOptions extends FetchMetadataOptions {
  /** Skip metadata fetch if tokenURI is null */
  skipIfNoURI?: boolean;
}

/**
 * Helper to fetch metadata for a token.
 */
async function fetchMetadataForToken(
  token: any,
  options: GetTokenWithMetadataOptions
): Promise<TokenWithMetadata> {
  let metadata: NFTMetadata | null = null;

  if (token.tokenURI && !options.skipIfNoURI) {
    try {
      metadata = await fetchTokenMetadata(token.tokenURI, options);
    } catch (error) {
      console.warn(`Failed to fetch metadata for token ${token.id}:`, error);
    }
  }

  return { ...token, metadata };
}

/**
 * Fetches a token from the subgraph and its metadata from the tokenURI.
 *
 * @example
 * ```typescript
 * const result = await getTokenWithMetadata(client, { id: '0x..._1' });
 * if (result.data) {
 *   console.log(result.data.metadata?.name);
 * }
 * ```
 */
export async function getTokenWithMetadata(
  client: Client,
  variables: GetTokenVariables,
  options: GetTokenWithMetadataOptions = {}
): Promise<{ data: TokenWithMetadata | null; error: Error | null }> {
  try {
    const result = await client.query(GetTokenDocument, variables).toPromise();

    if (result.error) {
      return { data: null, error: result.error };
    }

    const token = result.data?.token;
    if (!token) {
      return { data: null, error: null };
    }

    const tokenWithMetadata = await fetchMetadataForToken(token, options);
    return { data: tokenWithMetadata, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Fetches multiple tokens from the subgraph and their metadata from tokenURIs.
 *
 * @example
 * ```typescript
 * const result = await getTokensWithMetadata(client, { first: 10, skip: 0 });
 * if (result.data) {
 *   result.data.forEach(token => console.log(token.metadata?.name));
 * }
 * ```
 */
export async function getTokensWithMetadata(
  client: Client,
  variables: GetTokensVariables,
  options: GetTokenWithMetadataOptions = {}
): Promise<{ data: TokenWithMetadata[] | null; error: Error | null }> {
  try {
    const result = await client.query(GetTokensDocument, variables).toPromise();

    if (result.error) {
      return { data: null, error: result.error };
    }

    const tokens = result.data?.tokens;
    if (!tokens || tokens.length === 0) {
      return { data: [], error: null };
    }

    const tokensWithMetadata = await Promise.all(
      tokens.map((token: any) => fetchMetadataForToken(token, options))
    );

    return { data: tokensWithMetadata, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Fetches tokens by owner from the subgraph and their metadata from tokenURIs.
 *
 * @example
 * ```typescript
 * const result = await getTokensByOwnerWithMetadata(client, {
 *   owner: '0x...',
 *   first: 10,
 *   skip: 0
 * });
 * ```
 */
export async function getTokensByOwnerWithMetadata(
  client: Client,
  variables: GetTokensByOwnerVariables,
  options: GetTokenWithMetadataOptions = {}
): Promise<{ data: TokenWithMetadata[] | null; error: Error | null }> {
  try {
    const result = await client.query(GetTokensByOwnerDocument, variables).toPromise();

    if (result.error) {
      return { data: null, error: result.error };
    }

    const tokens = result.data?.tokens;
    if (!tokens || tokens.length === 0) {
      return { data: [], error: null };
    }

    const tokensWithMetadata = await Promise.all(
      tokens.map((token: any) => fetchMetadataForToken(token, options))
    );

    return { data: tokensWithMetadata, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Fetches tokens by contract from the subgraph and their metadata from tokenURIs.
 *
 * @example
 * ```typescript
 * const result = await getTokensByContractWithMetadata(client, {
 *   contract: '0x...',
 *   first: 10,
 *   skip: 0
 * });
 * ```
 */
export async function getTokensByContractWithMetadata(
  client: Client,
  variables: GetTokensByContractVariables,
  options: GetTokenWithMetadataOptions = {}
): Promise<{ data: TokenWithMetadata[] | null; error: Error | null }> {
  try {
    const result = await client.query(GetTokensByContractDocument, variables).toPromise();

    if (result.error) {
      return { data: null, error: result.error };
    }

    const tokens = result.data?.tokens;
    if (!tokens || tokens.length === 0) {
      return { data: [], error: null };
    }

    const tokensWithMetadata = await Promise.all(
      tokens.map((token: any) => fetchMetadataForToken(token, options))
    );

    return { data: tokensWithMetadata, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
