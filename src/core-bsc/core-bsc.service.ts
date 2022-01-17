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
import * as ERC20ABI from './abi/ERC20.abi.json';
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
            for(let i=0; i<4; i++){
                RPC_URL.map((rpc) => {
                    const conn = new ethers.providers.JsonRpcProvider(rpc); 
                    if( conn ){
                        this.providers.push(conn)
                        console.log('[INFO] Registered RPC ', rpc);
                    }
                })
            }
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
        if(address)
        try{
            const ercType = this.getContractInstance( 
                address, ERC20ABI
            ) as ERC20Abi; 
            //TODO: There might be a better way
            const [name, decimals] = await Promise.allSettled([
                ercType.name(), 
                ercType.decimals(), 
            ]) as PromiseFulfilledResult<any>[]; 
            return { 
                name: name.value || 'CALL_ERR',
                decimals: decimals.value || 'CALL_ERR',
                address, 
            }
        } 
        catch(e){ 
            console.error("ERR -- fetchTokendetails", address, e);
        }
    }
    private async fetchLPDetails(address:string){
        if(address)
        try{
        const lpType = this.getContractInstance(
            address, IUniswapV2Pair_ABI
        ) as UniswapV2pairAbi;
            const [token0, token1] = await Promise.allSettled([ 
                lpType.token0(), 
                lpType.token1(), 
            ]) as PromiseFulfilledResult<any>[];

            return {
                token0: token0.value, 
                token1: token1.value,
            }
        }
        catch(e){ 
            console.error("ERR -- fetchLPdetails", address, e);
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
            if( lpDetails.token0 || lpDetails.token1 ) {
                this.token[key] = {...tokenDetails, ...lpDetails, type:'lp' };
            }
            else 
                this.token[key] = {...tokenDetails, type:'ERC20'}; 
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
                ({call, inputs}) => target[call](...inputs)
            ));
        return results;
    }
}

