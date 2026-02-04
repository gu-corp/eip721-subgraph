import { gql } from '@urql/core';
import type { Client } from '@urql/core';

export const GetGlobalStatisticsDocument = gql`
  query GetGlobalStatistics {
    all(id: "all") {
      id
      numTokenContracts
      numTokens
      numOwners
    }
  }
`;

export async function getGlobalStatistics(client: Client) {
  return client.query(GetGlobalStatisticsDocument, {}).toPromise();
}
