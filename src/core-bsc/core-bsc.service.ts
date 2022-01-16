import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { JsonRpcProvider } from '@ethersproject/providers';
import { JsonFragment } from '@ethersproject/abi';
import { 
    Contract as MulticallContract, 
    ContractCall, 
    Provider as MulticallProvider 
} from 'ethers-multicall';  
import { RPC_URL } from './config';
import { TokenInfo } from './interface/token.interface';
import { ERC20Abi } from 'types/ethers-contracts/ERC20Abi';
import * as ERC20ABI from './abi/ERC20.abi.json';
import * as IUniswapV2Pair_ABI from './abi/UniswapV2pair.abi.json';
import { UniswapV2pairAbi } from 'types/ethers-contracts';
import axios from 'axios';

@Injectable()
export class CoreBscService {
    private provider: JsonRpcProvider;
    private multicallInstance: MulticallProvider;
    // Local cache for token & LPs
    private token: TokenInfo = {};
    private lps: TokenInfo;
    
    constructor(){ 
        this.getProvider();
        this.getMulticallInstance();
    }

    getProvider(){ 
        if( !this.provider ) 
            this.setProvider(new ethers.providers.JsonRpcProvider(
                RPC_URL[0]
            ))
        return this.provider; 
    }
    setProvider(newProvider: JsonRpcProvider){ 
        this.provider = newProvider; 
    }
    getContractInstance(address:string, abi:ethers.ContractInterface){ 
        return new ethers.Contract(address,abi,this.getProvider()); 
    }

/*
 *  Tokens Related Functionalities (ERC20/LP)
 */     
    private async fetchTokenDetails(address:string){
        //TODO: refactor to config.ts
        // const {data} = await axios.get(`https://api.pancakeswap.info/api/tokens/${address}`);
        // console.log(res.data);
        // if (res.status !== 200){
            const ercType = this.getContractInstance( 
                address, ERC20ABI
            ) as ERC20Abi; 
            const [name, decimals] = await Promise.allSettled([
                ercType.name(), 
                ercType.decimals(), 
            ]) as PromiseFulfilledResult<any>[]; 
            return { 
                name: name.value || 'CALL_ERR',
                decimals: decimals.value || 'CALL_ERR',
                address, 
            }
        // }
        // if(res.data.data.name.includes('LP'))
        //     return PromiseRejectionEvent; 
        // return res.data.data;
    }
    private async fetchLPDetails(address:string){
        const lpType = this.getContractInstance(
            address, IUniswapV2Pair_ABI
        ) as UniswapV2pairAbi;
        const [token0, token1] = await Promise.allSettled([ 
            lpType.token0(), 
            lpType.token1(), 
        ]) as PromiseFulfilledResult<any>[];
        if( !token0.value || !token1.value )
            return undefined
        return { 
            token0: token0.value || 'CALL_ERR', 
            token1: token1.value || 'CALL_ERR',
        }
    }
    async getTokenDetails(address: string, forceUpdate: boolean = false){
        //TODO: add stale refetch from updated_at 
        if( !this.token[address] || forceUpdate ){ 
            const tokenDetails = await this.fetchTokenDetails(address); 
            const lpDetails = await this.fetchLPDetails(address); 
            this.token[address] = { ...tokenDetails, ...lpDetails}; 
        }
        return this.token[address];
    }


/*
 *  Multicall Related Functionalities
 */ 
    async getMulticallInstance(): Promise<MulticallProvider> {
        if( !this.multicallInstance ){
            this.multicallInstance = new MulticallProvider(this.provider);
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
            ({call, inputs}) => target[call](inputs)
        ));
        return results;
    }

}
function ERC20Token_ABI(wantToken: any, ERC20Token_ABI: any): ERC20Abi {
    throw new Error('Function not implemented.');
}

