import { gql } from '@urql/core';
import type { Client } from '@urql/core';

export const GetTokenContractDocument = gql`
  query GetTokenContract($id: ID!) {
    tokenContract(id: $id) {
      id
      name
      symbol
      doAllAddressesOwnTheirIdByDefault
      supportsEIP721Metadata
      numTokens
      numOwners
    }
  }
`;

export const GetTokenContractsDocument = gql`
  query GetTokenContracts(
    $first: Int!
    $skip: Int!
    $orderBy: TokenContract_orderBy
    $orderDirection: OrderDirection
  ) {
    tokenContracts(
      first: $first
      skip: $skip
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      id
      name
      symbol
      doAllAddressesOwnTheirIdByDefault
      supportsEIP721Metadata
      numTokens
      numOwners
    }
  }
`;

export interface GetTokenContractVariables {
  id: string;
}

export interface GetTokenContractsVariables {
  first: number;
  skip: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export async function getTokenContract(
  client: Client,
  variables: GetTokenContractVariables
) {
  return client.query(GetTokenContractDocument, variables).toPromise();
}

export async function getTokenContracts(
  client: Client,
  variables: GetTokenContractsVariables
) {
  return client.query(GetTokenContractsDocument, variables).toPromise();
}
