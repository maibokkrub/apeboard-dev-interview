import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { JsonFragment } from '@ethersproject/abi';
import { 
    Contract as MulticallContract, 
    ContractCall, 
    Provider as MulticallProvider 
} from 'ethers-multicall';  
import { PAIRLIST_ENDPOINT, RPC_URL, TOKENLIST_ENDPOINT, TOKEN_ENDPOINT } from './config';
import { TokenInfo } from './interface/token.interface';
import { ERC20Abi } from 'types/ethers-contracts/ERC20Abi';
import * as ERC20Token_ABI from './abi/ERC20.abi.json';
import * as IUniswapV2Pair_ABI from './abi/UniswapV2pair.abi.json';
import { UniswapV2pairAbi } from 'types/ethers-contracts';
import axios from 'axios';

@Injectable()
export class CoreBscService {
    private providers: JsonRpcProvider[] = [];
    private multicallInstance: MulticallProvider;
    // Local cache for token & LPs
    private token:any = {};
    
    constructor(){ 
        this.getProvider();
        this.getMulticallInstance();
        this.getTokenListFromAPI(); 
    }

    getProvider(){ 
        if( !this.providers.length ){
            RPC_URL.map((rpc) => {
                const conn = new ethers.providers.JsonRpcProvider(rpc); 
                if( conn ){
                    this.providers.push(conn)
                    console.log('[INFO] Registered RPC ', rpc);
                }
            })
        }
        return this.providers[Math.floor(Math.random() * 32)%this.providers.length]; 
    }
    getContractInstance(address:string, abi:ethers.ContractInterface){ 
        if( address && abi )
            return new ethers.Contract(address,abi,this.getProvider()); 
        throw Error("getContractInstance: Missing address or abi")
    }

/*
 *  Tokens Related Functionalities (ERC20/LP)
 *  fetch___Details: Fetch from blockchain
 *  fetch___FromAPI: Fetch from public API endpoint: pancake / conigeckgo ...
 *     The top 1000 tokens & 1000 pairs will be prefetched
 *     from PancakeSwap API to populate the token cache
 */
    private async fetchTokenListFromAPI(source:string = 'pancake'){
        const url = TOKENLIST_ENDPOINT[source];
        if( url ){
            console.log(`[INFO] Fetching tokenList from ${url}`);
            const {data} = await axios.get(url) || undefined;
            return data.data;
        }
        return undefined;
    }
    private async fetchPairListFromAPI(source:string = 'pancake'){
        const url = PAIRLIST_ENDPOINT[source];
        if( url ){
            console.log(`[INFO] Fetching tokenList from ${url}`);
            const {data} = await axios.get(url) || undefined;
            return data.data;
        }
        return undefined;
    }
    private async fetchTokenFromAPI(address:string, source:string = 'pancake'){ 
        const url = TOKEN_ENDPOINT[source].replace(':address', address);
        if( url ){
            console.log(`[INFO] Fetching token from ${url}`);
            const {data} = await axios.get(url) || undefined;
            if( data ) 
                switch( source ){ 
                    case 'pancake': 
                        return data.data; 
                }
        }
        return undefined;
    }
    private async fetchTokenDetails(address:string){
        let tries = 2;
        while(address){
            try{
                const res = await this.batchCallsTo(
                    address, ERC20Token_ABI,[
                        {call: 'name', inputs: undefined},
                        {call: 'decimals', inputs: undefined},
                        {call: 'symbol', inputs: undefined},
                    ]
                )
                return { 
                    address,
                    name: res[0], 
                    decimals: res[1], 
                    symbol: res[2],
                    type: 'ERC20',
                }
            } 
            catch(e){
                if( --tries <=0 ){
                    return undefined;
                }
            }
        }
    }
    private async fetchLPDetails(address:string){
        let tries = 2;
        while(address){
            try{
            // const lpType = this.getContractInstance(
            //     address, IUniswapV2Pair_ABI
            // ) as UniswapV2pairAbi;
            //     const [token0, token1] = await Promise.allSettled([ 
            //         lpType.token0(), 
            //         lpType.token1(), 
            //     ]) as PromiseFulfilledResult<any>[];

            //     return {
            //         token0: token0.value, 
            //         token1: token1.value,
            //     }
                const res = await this.batchCallsTo(
                    address, IUniswapV2Pair_ABI,[
                        {call: 'token0', inputs: undefined},
                        {call: 'token1', inputs: undefined},
                        {call: 'name', inputs: undefined},
                        {call: 'symbol', inputs: undefined},
                    ]
                )
                return { 
                    address,
                    token0: res[0], 
                    token1: res[1], 
                    name: res[2], 
                    symbol: res[3],
                    type: 'lp',
                }
            }
            catch(e){ 
                if( --tries <=0 ){
                    return undefined;
                }
            }
        }
    }
    async getTokenListFromAPI(){ 
        const tokenList = (await this.fetchTokenListFromAPI()) as Object;
        const pairList  = (await this.fetchPairListFromAPI())  as Object;
        for( const keys in tokenList){
            this.token[keys.toLowerCase()] = {
                ...tokenList[keys],
                type: 'ERC20',
            }
        }
        //TODO: if not pancake not work
        for( const keys in pairList){ 
            const key = (pairList[keys].pair_address).toLowerCase();
            this.token[key] = { 
                type: 'lp',
                name: pairList[keys].base_name, 
                token0: pairList[keys].base_address, 
                token1: pairList[keys].quote_address,
            }
        }
    }
    async getTokenDetails(address: string, forceUpdate: boolean = false){
        //TODO: add stale refetch from updated_at 
        const key = address.toLowerCase()
        if( !this.token[key] || forceUpdate ){ 
            const lpDetails = await this.fetchLPDetails(address);
            const tokenDetails = await this.fetchTokenDetails(address); 
            this.token[key] = {...tokenDetails, ...lpDetails};
        }
        return this.token[key];
    }


/*
 *  Multicall Related Functionalities
 */ 
    async getMulticallInstance(): Promise<MulticallProvider> {
        if( !this.multicallInstance ){
            this.multicallInstance = new MulticallProvider(this.providers[0]);
            await this.multicallInstance.init();
        }
        return this.multicallInstance;
    }
    getMulticallContractInstance(address:string, abi:JsonFragment[]) { 
        return new MulticallContract(address, abi); 
    }
    async multicall(calls: ContractCall[]){ 
        return await (await this.getMulticallInstance()).all(calls);
    }

   /* 
    * batchCalls() use multicall to fetch data from same target address
    * with different functions and inputs
    */
    async batchCallsTo(address:string, abi:JsonFragment[], calls:{call:string,inputs:any}[]) {
        const target = this.getMulticallContractInstance(address, abi);
            const results = await this.multicall(calls.map(
                ({call, inputs}) => {
                    if( Array.isArray(inputs) )
                        return target[call](...inputs)
                    if( inputs ) 
                        return target[call](inputs)
                    return target[call]()
                }
            ));
        return results;
    }
}

