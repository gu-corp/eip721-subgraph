import { gql } from '@urql/core';
import type { Client } from '@urql/core';

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
