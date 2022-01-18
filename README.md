
## About

This is an assignment for ApeBoard interview.

## Known Issues

-   Price logic is only fetched from Pancakeswap, and no stale period.
-   poolRewards are hard coded with $AUTO (not sure about logic)
-   not all tokens has a price. Only those in top 1000 pancake list is fetched. 

## Staring Container

There is no published version of the container. You'll need to manually build and run the conatiner.

```
docker build -t apeapi . && docker run --rm -it -p 3000:3000 apeapi
```


## Manual Set Up 
```
yarn 
yarn start
```

## Available endpoints 

```
GET /autofarm/cache/update
```
Updates available pool infos from smart contract.
Returns all pools data. Will refetch the poolInfos, while use the cached token data. 
Could extend to refetch token data in future endpoints. 

--- 

```
GET /autofarm/{address}
```
Returns farms staked by the `{address}` provided.

--- 

```
GET /autofarm/token/{address}
```
Returns token data for the `{address}` provided. 
This is just a quick tool for debugging purposes.

# Modules & Structure 

This project was designed to support multiple chain logic.
`core-{chain}` will house all the logistics, e.g., connections, contracts, token, ...
`{chain}/{dApp}` will house all logics specific to the application.

The repository currenlty holds 2 services. 
```
 - core-bsc         BSC connections, Token name, Multicall
 - bsc 
    |- autofarm     PoolInfos, Staked Tokens, ...
```
