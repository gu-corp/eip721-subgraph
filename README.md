# EIP-721 Subgraph

## Deployment
```
NETWORK_NAME=xxx START_BLOCK=xxx SUBGRAPH_NAME=xxx GRAPH_NODE_URL=xxx IPFS_URL=xxx VERSION=xxx sh deploy.sh
```
Notes:
- NETWORK_NAME: Deployed network name in Graphnode
- START_BLOCK: Start block
- SUBGRAPH_NAME: Subgraph name
- GRAPH_NODE_URL: Graphnode admin url
- IPFS_URL: IPFS url
- VERSION: Subgraph version. Ex: v0.0.9

## Example graphQL query
```
{
  tokens {
    contract
    tokenID
    owner
    tokenURI
  }
}
```


or

```
{
  tokens(orderBy: mintTime) {
    contract
    tokenID
    owner
    tokenURI
    mintTime
  }
  
  tokenContracts {
    id
  }
}
```
