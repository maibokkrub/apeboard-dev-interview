
## About

This is an assignment for ApeBoard interview.

## Known Issues

-   Price logic is only fetched from Pancakeswap, and no stale period.
-   poolRewards are hard coded with $AUTO (not sure about logic)
-   not all tokens has a price. Only those in top 1000 pancake list is fetched. 

## Set Up 
```
cd src
yarn 
yarn start
```

## Available endpoints 

```
GET /autofarm/cache/update
```
Updates available pool infos from smart contract.
Returns all pools data.

--- 

```
GET /autofarm/{address}
```
Returns farms staked by the `{address}` provided.


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
