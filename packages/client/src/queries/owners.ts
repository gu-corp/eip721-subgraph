import { gql } from '@urql/core';
import type { Client } from '@urql/core';

export const GetOwnerDocument = gql`
  query GetOwner($id: ID!) {
    owner(id: $id) {
      id
      numTokens
    }
  }
`;

export const GetOwnersDocument = gql`
  query GetOwners(
    $first: Int!
    $skip: Int!
    $orderBy: Owner_orderBy
    $orderDirection: OrderDirection
  ) {
    owners(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      numTokens
    }
  }
`;

export const GetOwnerPerTokenContractDocument = gql`
  query GetOwnerPerTokenContract($id: ID!) {
    ownerPerTokenContract(id: $id) {
      id
      numTokens
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

export const GetOwnerPerTokenContractsDocument = gql`
  query GetOwnerPerTokenContracts($owner: String!, $first: Int!, $skip: Int!) {
    ownerPerTokenContracts(first: $first, skip: $skip, where: { owner: $owner }) {
      id
      numTokens
      contract {
        id
        name
        symbol
        numTokens
      }
    }
  }
`;

export interface GetOwnerVariables {
  id: string;
}

export interface GetOwnersVariables {
  first: number;
  skip: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface GetOwnerPerTokenContractVariables {
  id: string;
}

export interface GetOwnerPerTokenContractsVariables {
  owner: string;
  first: number;
  skip: number;
}

export async function getOwner(client: Client, variables: GetOwnerVariables) {
  return client.query(GetOwnerDocument, variables).toPromise();
}

export async function getOwners(client: Client, variables: GetOwnersVariables) {
  return client.query(GetOwnersDocument, variables).toPromise();
}

export async function getOwnerPerTokenContract(
  client: Client,
  variables: GetOwnerPerTokenContractVariables
) {
  return client.query(GetOwnerPerTokenContractDocument, variables).toPromise();
}

export async function getOwnerPerTokenContracts(
  client: Client,
  variables: GetOwnerPerTokenContractsVariables
) {
  return client.query(GetOwnerPerTokenContractsDocument, variables).toPromise();
}
