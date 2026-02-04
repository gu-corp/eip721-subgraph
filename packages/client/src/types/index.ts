export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigInt: { input: string; output: string; }
  Bytes: { input: string; output: string; }
  Int8: { input: number; output: number; }
};

export type All = {
  __typename?: 'All';
  id: Scalars['ID']['output'];
  numOwners: Scalars['BigInt']['output'];
  numTokenContracts: Scalars['BigInt']['output'];
  numTokens: Scalars['BigInt']['output'];
};

export type Owner = {
  __typename?: 'Owner';
  id: Scalars['ID']['output'];
  numTokens: Scalars['BigInt']['output'];
  tokens: Array<Token>;
};

export type OwnerPerTokenContract = {
  __typename?: 'OwnerPerTokenContract';
  contract: TokenContract;
  id: Scalars['ID']['output'];
  numTokens: Scalars['BigInt']['output'];
  owner: Owner;
};

export type Token = {
  __typename?: 'Token';
  contract: TokenContract;
  id: Scalars['ID']['output'];
  mintTime: Scalars['BigInt']['output'];
  owner: Owner;
  tokenID: Scalars['BigInt']['output'];
  tokenURI: Scalars['String']['output'];
};

export type TokenContract = {
  __typename?: 'TokenContract';
  doAllAddressesOwnTheirIdByDefault: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  numOwners: Scalars['BigInt']['output'];
  numTokens: Scalars['BigInt']['output'];
  supportsEIP721Metadata: Scalars['Boolean']['output'];
  symbol: Maybe<Scalars['String']['output']>;
  tokens: Array<Token>;
};
