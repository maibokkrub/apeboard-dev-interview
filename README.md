
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